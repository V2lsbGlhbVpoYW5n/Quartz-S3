import path from "path"
import { rm, mkdir, writeFile } from "fs/promises"
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3"

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

function normalizePrefix(prefix = "") {
  if (!prefix) return ""
  return prefix.endsWith("/") ? prefix : `${prefix}/`
}

export default async function loadFromS3({ argv, cwd }) {
  const bucket = process.env.S3_BUCKET
  if (!bucket) {
    throw new Error("Missing required env var: S3_BUCKET")
  }

  const region = process.env.AWS_REGION || "us-east-1"
  const prefix = normalizePrefix(process.env.S3_PREFIX || "")
  const endpoint = process.env.S3_ENDPOINT || undefined
  const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || "false").toLowerCase() === "true"
  const cleanContent = (process.env.S3_CLEAN_CONTENT || "true").toLowerCase() !== "false"

  const contentDir = path.isAbsolute(argv.directory)
    ? argv.directory
    : path.join(cwd, argv.directory || "content")

  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle,
  })

  if (cleanContent) {
    await rm(contentDir, { recursive: true, force: true })
  }
  await mkdir(contentDir, { recursive: true })

  let token = undefined
  let downloaded = 0

  do {
    const listResp = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    )

    const objects = listResp.Contents || []
    for (const obj of objects) {
      const key = obj.Key
      if (!key || key.endsWith("/")) continue

      const relativePath = prefix ? key.slice(prefix.length) : key
      if (!relativePath || relativePath.startsWith("../")) continue

      const outputPath = path.join(contentDir, relativePath)
      await mkdir(path.dirname(outputPath), { recursive: true })

      const getResp = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      )

      if (!getResp.Body) continue
      const content = await streamToBuffer(getResp.Body)
      await writeFile(outputPath, content)
      downloaded += 1
    }

    token = listResp.NextContinuationToken
  } while (token)

  console.log(`S3 loader finished: downloaded ${downloaded} objects into ${contentDir}`)
}
