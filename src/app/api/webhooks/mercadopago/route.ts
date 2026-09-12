import { NextResponse } from 'next/server'
import { Payment, PreApproval } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'
import { adminDb } from '@/lib/firebase-admin'
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
        const userRef = adminDb.collection('users').doc(uid)
        
        if (status === 'approved' || status === 'authorized') {
          const isAnnual = planType.toLowerCase().includes('anual') || subscriptionData.preapproval_plan_id === process.env.MP_ANNUAL_PLAN_ID
          const daysToAdd = isAnnual ? 365 : 30
          const endsAt = new Date()
          endsAt.setDate(endsAt.getDate() + daysToAdd)

          // Usamos la nomenclatura correcta (plan: 'vip')
          await userRef.update({
            plan: 'vip',
            subscriptionEndsAt: FieldValue.serverTimestamp(),
            planNotification: 'upgraded',
            subscriptionId: dataId
          })
          
          await userRef.update({
            subscriptionEndsAt: endsAt
          })
          
          console.log(`✅ User ${uid} upgraded to VIP (${isAnnual ? 'Annual' : 'Monthly'})`)
        } else if (status === 'rejected' || status === 'cancelled' || status === 'refunded') {
          await userRef.update({
            plan: 'free',
            planNotification: 'downgraded'
          })
          console.log(`❌ User ${uid} downgraded to Free (Status: ${status})`)
        }
      } else {
        console.log(`⚠️ No external_reference (uid) found for transaction ${dataId}.`)
      }
    }

    // 3. Devolver 200 OK rápido
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}