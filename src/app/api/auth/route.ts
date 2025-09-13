import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  
  // Simulación temporal - después integraremos ChipiPay
  // Por ahora solo validamos email y creamos sesión básica
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Generar usuario desde email
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // En producción esto sería un JWT real
  const mockToken = Buffer.from(JSON.stringify({ 
    email, 
    username,
    walletAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    createdAt: Date.now()
  })).toString('base64')

  return NextResponse.json({ 
    success: true,
    token: mockToken,
    username,
    message: 'Check your email for magic link (demo mode: auto-login)'
  })
}