/** 十二平均律音名数据 */
export interface Note {
  name: string
  midi: number
  frequency: number
  isBlack: boolean
}

/** 按八度分组的键盘布局 */
export interface OctaveLayout {
  octave: number
  whiteKeys: Note[]
  blackKeys: Array<Note & { position: number }>
}
