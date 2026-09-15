import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ dataSource: "MOCK — somente desenvolvimento; não são preços reais.", history: [{ date: "2026-09-01", price: 1240 }, { date: "2026-09-05", price: 1160 }, { date: "2026-09-10", price: 990 }] }); }
