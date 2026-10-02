import type { Lab, Recommendation } from './types'

export interface InterestQuery {
  interestField: string
  coursework: string
  wantToKnow: string
}

const PARTICLES = ['을', '를', '이', '가', '은', '는', '과', '와', '도', '에', '의', '로']

export function recommendLabs(labs: readonly Lab[], input: InterestQuery): Recommendation[] {
  const interestRaw = input.interestField.trim()
  if (!interestRaw) return []
  const optionalRaw = `${input.coursework} ${input.wantToKnow}`.trim()
  const ranked: { score: number; labId: string; rec: Recommendation }[] = []

  for (const lab of labs) {
    const matchedTags = lab.tags.filter((tag) => textHasTag(interestRaw, tag))
    if (matchedTags.length === 0) continue
    const matchedOptionalTags = optionalRaw
      ? lab.tags.filter((tag) => !matchedTags.includes(tag) && textHasTag(optionalRaw, tag))
      : []
    ranked.push({
      labId: lab.id,
      score: matchedTags.length * 2 + matchedOptionalTags.length,
      rec: {
        labId: lab.id,
        reason: buildReason(interestRaw, matchedTags, matchedOptionalTags),
        matchedTags,
        matchedOptionalTags,
      },
    })
  }

  ranked.sort((a, b) => b.score - a.score || a.labId.localeCompare(b.labId))
  return ranked.map((item) => item.rec)
}

function buildReason(interest: string, tags: string[], optionalTags: string[]): string {
  const shown = tags.slice(0, 3).join(', ')
  const text =
    tags.length > 3
      ? `입력한 관심 ‘${interest}’에서 ‘${shown}’ 외 ${tags.length - 3}개가 이 연구실의 주제와 겹칩니다.`
      : `입력한 관심 ‘${interest}’에서 ‘${shown}’이 이 연구실의 주제와 겹칩니다.`
  if (optionalTags.length === 0) return text
  return `${text} 선택 입력에서도 ‘${optionalTags.slice(0, 2).join(', ')}’이 함께 보였습니다.`
}

function textHasTag(text: string, tag: string): boolean {
  const normalizedText = normalize(text)
  const normalizedTag = normalize(tag)
  if (normalizedTag.length < 2) return false
  if (normalizedText.includes(normalizedTag)) return true
  return tokensOf(text).some(
    (token) => token.length >= 2 && (normalizedTag.includes(token) || token.includes(normalizedTag)),
  )
}

function tokensOf(text: string): string[] {
  const raw = text.toLowerCase().split(/[\s,./·()[\]"'“”‘’!?]+/).filter(Boolean)
  const tokens = new Set<string>()
  for (const token of raw) {
    tokens.add(token)
    const stripped = stripParticle(token)
    if (stripped.length >= 2) tokens.add(stripped)
  }
  return [...tokens]
}

function stripParticle(token: string): string {
  for (const particle of PARTICLES) {
    if (token.length > particle.length + 1 && token.endsWith(particle)) {
      return token.slice(0, -particle.length)
    }
  }
  return token
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '')
}
