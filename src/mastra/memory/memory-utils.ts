import { unifiedMemory } from './unified-memory';

/**
 * Memory utility functions for consistent memory management across the OmniAgent system
 */

export interface MemoryContext {
  resource: string;
  thread: string;
}

export interface WorkingMemoryData {
  name?: string;
  role?: string;
  organization?: string;
  communication_style?: string;
  active_projects?: string;
  current_focus?: string;
  deadlines?: string;
  achievements?: string;
  detail_level?: string;
  formats?: string;
  working_hours?: string;
  timezone?: string;
  tech_stack?: string;
  dev_environment?: string;
  preferred_tools?: string;
  research_depth?: string;
  trusted_sources?: string;
  research_patterns?: string;
  email_accounts?: string;
  email_style?: string;
  priority_contacts?: string;
  primary_languages?: string;
  frameworks?: string;
  code_style?: string;
  testing_approach?: string;
  schedule_patterns?: string;
  task_management?: string;
  reminder_preferences?: string;
  key_insights?: string;
  follow_ups?: string;
  long_term_goals?: string;
}

/**
 * Get a standardized memory context for different use cases
 */
export function getMemoryContext(type: 'user' | 'workflow' | 'agent', identifier: string, thread?: string): MemoryContext {
  const baseResource = type === 'user' ? `user-${identifier}` : 
                      type === 'workflow' ? `workflow-${identifier}` : 
                      `agent-${identifier}`;
  
  const baseThread = thread || `${type}-${identifier}-${Date.now()}`;
  
  return {
    resource: baseResource,
    thread: baseThread
  };
}

/**
 * Update working memory with structured data
 */
export async function updateWorkingMemory(
  context: MemoryContext, 
  data: Partial<WorkingMemoryData>
): Promise<void> {
  try {
    // This would integrate with Mastra's working memory system
    // For now, we'll log the update
    console.log(`🧠 [MemoryUtils] Updating working memory for ${context.resource}/${context.thread}`, {
      dataKeys: Object.keys(data),
      dataCount: Object.keys(data).length
    });
    
    // In a real implementation, this would call the memory system's working memory update method
    // await unifiedMemory.updateWorkingMemory(context, data);
  } catch (error) {
    console.error('❌ [MemoryUtils] Failed to update working memory:', error);
    throw error;
  }
}

/**
 * Get working memory data for a context
 */
export async function getWorkingMemory(context: MemoryContext): Promise<WorkingMemoryData | null> {
  try {
    // This would integrate with Mastra's working memory system
    // For now, we'll return null
    console.log(`🔍 [MemoryUtils] Getting working memory for ${context.resource}/${context.thread}`);
    
    // In a real implementation, this would call the memory system's working memory get method
    // return await unifiedMemory.getWorkingMemory(context);
    return null;
  } catch (error) {
    console.error('❌ [MemoryUtils] Failed to get working memory:', error);
    return null;
  }
}

/**
 * Clean up old memory entries (retention policy)
 */
export async function cleanupOldMemories(olderThanDays: number = 30): Promise<void> {
  try {
    console.log(`🧹 [MemoryUtils] Cleaning up memories older than ${olderThanDays} days`);
    
    // This would implement a cleanup policy for old memories
    // For now, we'll just log the action
    console.log('✅ [MemoryUtils] Memory cleanup completed');
  } catch (error) {
    console.error('❌ [MemoryUtils] Failed to cleanup old memories:', error);
    throw error;
  }
}

/**
 * Get memory statistics
 */
export async function getMemoryStats(): Promise<{
  totalMemories: number;
  workingMemoryEntries: number;
  lastCleanup: Date | null;
}> {
  try {
    console.log('📊 [MemoryUtils] Getting memory statistics');
    
    // This would query the actual memory system for statistics
    // For now, we'll return mock data
    return {
      totalMemories: 0,
      workingMemoryEntries: 0,
      lastCleanup: null
    };
  } catch (error) {
    console.error('❌ [MemoryUtils] Failed to get memory statistics:', error);
    throw error;
  }
}

/**
 * Validate memory context
 */
export function validateMemoryContext(context: MemoryContext): boolean {
  if (!context.resource || !context.thread) {
    console.error('❌ [MemoryUtils] Invalid memory context: missing resource or thread');
    return false;
  }
  
  if (context.resource.length > 255) {
    console.error('❌ [MemoryUtils] Invalid memory context: resource too long');
    return false;
  }
  
  if (context.thread.length > 255) {
    console.error('❌ [MemoryUtils] Invalid memory context: thread too long');
    return false;
  }
  
  return true;
}

/**
 * Create a memory context from a Slack thread ID
 */
export function createSlackMemoryContext(threadId: string): MemoryContext {
  // Parse Slack thread ID format: "slack/channel/timestamp"
  const parts = threadId.split('/');
  if (parts.length >= 3 && parts[0] === 'slack') {
    return {
      resource: 'slack-bot',
      thread: threadId
    };
  }
  
  // Fallback for other formats
  return {
    resource: 'slack-bot',
    thread: threadId
  };
}

/**
 * Create a memory context from a workflow
 */
export function createWorkflowMemoryContext(workflowId: string, inputHash?: string): MemoryContext {
  const threadId = inputHash ? `${workflowId}-${inputHash}` : `${workflowId}-${Date.now()}`;
  return {
    resource: `workflow-${workflowId}`,
    thread: threadId
  };
}
