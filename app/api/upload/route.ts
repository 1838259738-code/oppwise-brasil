import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // 排查点 1：打印接收到的表单键值，确认前端传了什么
    console.log("=== 收到上传请求 ===")
    console.log("表单字段:", Array.from(formData.keys()))

    const titel = formData.get('titel') as string || 'Unbenannt Intel'
    const beschreibung = formData.get('beschreibung') as string || ''
    
    // 排查点 2：严格校验 ID 类型，防止 NaN 导致数据库崩溃
    const wettbewerberIdRaw = formData.get('wettbewerberId')
    const wettbewerberId = parseInt(wettbewerberIdRaw as string, 10)
    
    if (isNaN(wettbewerberId)) {
      throw new Error(`无效的 wettbewerberId: ${wettbewerberIdRaw} (前端传值异常)`)
    }

    const stadt = formData.get('stadt') as string || 'São Paulo'
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      throw new Error("没有检测到上传的文件 (files 字段为空)")
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const savedPaths: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = path.extname(file.name)
      const filename = `${uuidv4()}${ext}`
      await writeFile(path.join(uploadDir, filename), buffer)
      savedPaths.push(filename)
    }

    // 执行数据库写入
    const newIntel = await prisma.fieldIntel.create({
      data: {
        titel,
        wettbewerberId,
        stadt,
        screenType: "Promotion",
        userProfile: "General",
        dateiPfade: JSON.stringify(savedPaths),
        notizen: beschreibung,
      },
    })

    console.log("=== 上传并写入数据库成功 ===", newIntel.id)
    return NextResponse.json({ success: true, intelId: newIntel.id })

  } catch (error: any) {
    // 排查点 3：在终端打印出非常具体的错误栈
    console.error("!!! API 崩溃拦截 !!!")
    console.error("错误名称:", error.name)
    console.error("详细信息:", error.message)
    
    // 将具体错误返回给前端，方便在浏览器 Network 面板查看
    return NextResponse.json(
      { success: false, error: "Upload failed", details: error.message }, 
      { status: 500 }
    )
  }
}