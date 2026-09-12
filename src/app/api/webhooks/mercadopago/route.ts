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
    if (type === 'payment') {
      const paymentClient = new Payment(mpClient)
      const payment = await paymentClient.get({ id: dataId })
      
      uid = payment.external_reference || ''
      status = payment.status || ''
      planType = payment.description || 'Unknown'
      
    } else if (type === 'subscription_preapproval' || type === 'preapproval') {
      const preApprovalClient = new PreApproval(mpClient)
      const preApproval = await preApprovalClient.get({ id: dataId })
      
      uid = preApproval.external_reference || ''
      status = preApproval.status || ''
      planType = preApproval.reason || 'Unknown'
    } else {
      return NextResponse.json({ status: 'success' }, { status: 200 })
    }

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
        const isAnnual = planType.toLowerCase().includes('anual')
        const daysToAdd = isAnnual ? 365 : 30
        const endsAt = new Date()
        endsAt.setDate(endsAt.getDate() + daysToAdd)

        // Usamos la nomenclatura correcta (plan: 'vip')
        await userRef.update({
          plan: 'vip',
          subscriptionEndsAt: FieldValue.serverTimestamp(),
          planNotification: 'upgraded'
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

    // 3. Devolver 200 OK rápido
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}