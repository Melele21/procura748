import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Generic helpers ──────────────────────────────────────────────────────────
export async function dbLoad(table, fallback = []) {
  if (!supabaseUrl) {
    // Fallback to localStorage when Supabase not configured
    try {
      const r = localStorage.getItem(`proc:${table}`)
      return r ? JSON.parse(r) : fallback
    } catch { return fallback }
  }
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return fallback }
  return data || fallback
}

export async function dbInsert(table, record) {
  if (!supabaseUrl) {
    try {
      const existing = JSON.parse(localStorage.getItem(`proc:${table}`) || '[]')
      const updated = [record, ...existing]
      localStorage.setItem(`proc:${table}`, JSON.stringify(updated))
      return record
    } catch { return null }
  }
  const { data, error } = await supabase.from(table).insert([record]).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function dbUpdate(table, id, updates) {
  if (!supabaseUrl) {
    try {
      const existing = JSON.parse(localStorage.getItem(`proc:${table}`) || '[]')
      const updated = existing.map(r => r.id === id ? { ...r, ...updates } : r)
      localStorage.setItem(`proc:${table}`, JSON.stringify(updated))
      return updated.find(r => r.id === id)
    } catch { return null }
  }
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function dbGetCounter(name) {
  if (!supabaseUrl) {
    const val = parseInt(localStorage.getItem(`proc:counter:${name}`) || '0')
    return val
  }
  const { data } = await supabase.from('proc_counters').select('current_value').eq('name', name).single()
  return data?.current_value || 0
}

export async function dbIncrementCounter(name) {
  if (!supabaseUrl) {
    const current = parseInt(localStorage.getItem(`proc:counter:${name}`) || '0')
    const next = current + 1
    localStorage.setItem(`proc:counter:${name}`, String(next))
    return next
  }
  const { data } = await supabase.rpc('increment_counter', { counter_name: name })
  return data || 1
}
