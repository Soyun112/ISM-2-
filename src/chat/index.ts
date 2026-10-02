import { demoResponder, type Responder } from './demoResponder'

/** 나중에 실제 API 응답기로 바꿀 때 이 함수만 교체하면 됩니다. */
export function getResponder(): Responder {
  return demoResponder
}
