import { NextResponse } from 'next/server'
import { Payment, PreApproval } from 'mercadopago'
import { getMpClient } from '@/lib/mercadopago'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: Request) {
  try {
    let body: any = {}
    try {
        body = await req.json()
    } catch (e) {
        // Fallback if body is empty or invalid
    }

    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams)
    
    const type = body.type || queryParams.type || queryParams.topic
    const dataId = body.data?.id || queryParams['data.id'] || queryParams.id

    if (!dataId) {
      return NextResponse.json({ status: 'success' }, { status: 200 })
    }

    let uid = ''
    let status = ''
    let planType = ''

    // 1. Obtener los detalles reales de la API (Fuente de la verdad)
    if (type === 'subscription_preapproval' || type === 'preapproval') {
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      })
      const subscriptionData = await mpResponse.json()
      
      status = subscriptionData.status || ''
      planType = subscriptionData.reason || 'Unknown'
      uid = subscriptionData.external_reference || ''
      const payerEmail = subscriptionData.payer_email

      console.log('\n=============================================')
      console.log('✅ WEBHOOK RECIBIDO Y VALIDADO (MERCADO PAGO)')
      console.log(`- TIPO:   ${type}`)
      console.log(`- UID:    ${uid}`)
      console.log(`- PLAN:   ${planType}`)
      console.log(`- ESTADO: ${status}`)
      console.log('=============================================\n')

      // 2. Lógica de Actualización en Base de Datos por UID (Segura)
      if (uid) {
        const userRef = getAdminDb().collection('users').doc(uid)
        
        if (status === 'approved' || status === 'authorized') {
          await getAdminDb().runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef)
            if (!userDoc.exists) return

            const userData = userDoc.data()
            const isAnnual = planType.toLowerCase().includes('anual') || subscriptionData.preapproval_plan_id === process.env.MP_ANNUAL_PLAN_ID
            const daysToAdd = isAnnual ? 365 : 30
            
            let endsAt = new Date()
            if (userData?.subscriptionEndsAt) {
               const currentEndsAt = userData.subscriptionEndsAt.toDate ? userData.subscriptionEndsAt.toDate() : new Date(userData.subscriptionEndsAt)
               // Solo extendemos si la fecha actual es mayor a hoy, para no arrastrar fechas vencidas
               if (currentEndsAt > new Date()) {
                  endsAt = currentEndsAt
               }
            }
            endsAt.setDate(endsAt.getDate() + daysToAdd)

            // Usamos la nomenclatura correcta (plan: 'vip')
            transaction.update(userRef, {
              plan: 'vip',
              planNotification: 'upgraded',
              subscriptionId: dataId,
              isSubscriptionCancelled: false,
              subscriptionEndsAt: endsAt
            })
            
            console.log(`✅ User ${uid} upgraded to VIP (${isAnnual ? 'Annual' : 'Monthly'}) - Date stacked.`)
          })
        } else if (status === 'cancelled') {
          // MP fires cancelled when user manually cancels or all retries fail.
          // We DO NOT downgrade them immediately so they can enjoy their remaining days.
          await userRef.update({
            isSubscriptionCancelled: true
          })
          console.log(`⚠️ User ${uid} subscription cancelled but retains VIP until end date.`)
        } else if (status === 'rejected' || status === 'refunded') {
          // If a payment is refunded, or preapproval explicitly rejected before payment
          await userRef.update({
            plan: 'free',
            planNotification: 'downgraded',
            isSubscriptionCancelled: true
          })
          console.log(`❌ User ${uid} downgraded to Free (Status: ${status})`)
        }
      } else {
        console.log(`⚠️ No external_reference (uid) found for transaction ${dataId}.`)
      }
    } else if (type === 'payment') {
      const paymentClient = new Payment(getMpClient())
      const paymentData = await paymentClient.get({ id: dataId })
      
      status = paymentData.status || ''
      planType = paymentData.description || 'Unknown'
      uid = paymentData.external_reference || ''

      console.log('\n=============================================')
      console.log('🔄 WEBHOOK DE RENOVACIÓN (MERCADO PAGO)')
      console.log(`- TIPO:   ${type}`)
      console.log(`- UID:    ${uid}`)
      console.log(`- ESTADO: ${status}`)
      console.log('=============================================\n')

      if (uid && status === 'approved') {
        const userRef = getAdminDb().collection('users').doc(uid)
        
        await getAdminDb().runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef)
          if (!userDoc.exists) return

          const userData = userDoc.data()
          const processedPayments = userData?.processedPayments || []

          // Idempotency check: if payment already processed, do nothing
          if (processedPayments.includes(dataId)) {
            console.log(`⚠️ Payment ${dataId} already processed for user ${uid}. Skipping.`)
            return
          }

          const isAnnual = planType.toLowerCase().includes('anual')
          const daysToAdd = isAnnual ? 365 : 30
          
          let endsAt = new Date()
          if (userData?.subscriptionEndsAt) {
             const currentEndsAt = userData.subscriptionEndsAt.toDate ? userData.subscriptionEndsAt.toDate() : new Date(userData.subscriptionEndsAt)
             // Only extend from current date if it hasn't expired yet
             if (currentEndsAt > new Date()) {
                endsAt = currentEndsAt
             }
          }
          endsAt.setDate(endsAt.getDate() + daysToAdd)

          transaction.update(userRef, {
            subscriptionEndsAt: endsAt,
            processedPayments: FieldValue.arrayUnion(dataId),
            isSubscriptionCancelled: false
          })
          console.log(`✅ User ${uid} subscription renewed. Added ${daysToAdd} days.`)
        })
      }
    }

    // 3. Devolver 200 OK rápido
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error: any) {
    console.error('Error processing webhook:', error?.message || String(error))
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}