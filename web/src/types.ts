export type TabId = 'chat' | 'commerce' | 'community' | 'education' | 'hospital'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export interface SystemAction {
  intent: string
  recommended_module: TabId
  suggested_item_category?: string | null
  suggested_course?: string | null
  community_board?: string | null
  urgency_level: UrgencyLevel
  requires_hospital: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  action?: SystemAction
  timestamp: Date
}
