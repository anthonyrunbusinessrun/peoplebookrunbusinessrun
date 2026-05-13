/**
 * lib/birdy/agents/workflows.ts
 * Pre-built workflow definitions for Rayland / PeopleBook operations.
 * Each workflow is a reusable, observable, multi-step AI pipeline.
 */

import type { Workflow } from './types'

export const WORKFLOW_REGISTRY: Record<string, Workflow> = {

  'analyze-pipeline': {
    id:          'analyze-pipeline',
    name:        'Pipeline Analysis',
    description: 'Retrieve knowledge base context and generate a pipeline analysis report',
    category:    'recruiting',
    inputSchema: { focus: { type: 'string', description: 'Analysis focus area', required: false } },
    steps: [
      {
        name:   'get_roles',
        tool:   'get_roles',
        params: {},
      },
      {
        name:   'knowledge_search',
        tool:   'knowledge_search',
        params: { query: 'hiring pipeline status open roles', topK: 4 },
      },
      {
        name: 'ai_completion',
        tool: 'ai_completion',
        params: {
          model:  'claude',
          prompt: 'Analyze our current hiring pipeline. Use the role data and knowledge base context provided. Structure your analysis as: 1) Executive Summary 2) Open Roles by Department 3) Key Risks/Gaps 4) Recommended Actions. Be specific and actionable.',
        },
      },
      {
        name:   'format_markdown',
        tool:   'format_markdown',
        params: { style: 'report' },
      },
    ],
  },

  'draft-job-description': {
    id:          'draft-job-description',
    name:        'Draft Job Description',
    description: 'Search knowledge base for similar roles, then draft a complete JD',
    category:    'content',
    inputSchema: {
      roleTitle:  { type: 'string', description: 'Job title',      required: true },
      department: { type: 'string', description: 'Department',     required: true },
      level:      { type: 'string', description: 'Seniority level', required: false },
    },
    steps: [
      {
        name:   'knowledge_search',
        tool:   'knowledge_search',
        params: { topK: 3 },
        // query is built from input.roleTitle by the runner
      },
      {
        name: 'ai_completion',
        tool: 'ai_completion',
        params: {
          model:  'claude',
          prompt: 'Write a complete, professional job description for Rayland Inc. Include: Role Summary, Key Responsibilities (6-8 bullets), Required Qualifications (5-6), Nice-to-Have, and a brief About Rayland section. Match Rayland\'s direct, professional brand voice. No fluff.',
        },
      },
    ],
  },

  'screen-candidate': {
    id:          'screen-candidate',
    name:        'Candidate Screening Kit',
    description: 'Generate pre-screening questions, evaluation criteria, and red flags for a role',
    category:    'recruiting',
    inputSchema: {
      roleTitle: { type: 'string', description: 'Role being screened for', required: true },
    },
    steps: [
      {
        name:   'knowledge_search',
        tool:   'knowledge_search',
        params: { query: 'candidate screening criteria evaluation', topK: 3 },
      },
      {
        name: 'ai_completion',
        tool: 'ai_completion',
        params: {
          model:  'claude',
          prompt: 'Create a candidate screening kit. Include: 1) 8 phone screening questions with what good answers look like, 2) 5 key evaluation criteria with 1-5 scoring rubric, 3) 5 red flags to watch for, 4) 3 culture-fit questions. Format clearly for a recruiter to use during a 30-min call.',
        },
      },
    ],
  },

  'knowledge-summary': {
    id:          'knowledge-summary',
    name:        'Knowledge Base Summary',
    description: 'Search the knowledge base and produce a structured summary on a topic',
    category:    'analysis',
    inputSchema: {
      topic:    { type: 'string', description: 'Topic to summarize',    required: true },
      audience: { type: 'string', description: 'Intended audience',     required: false },
    },
    steps: [
      {
        name:   'knowledge_search',
        tool:   'knowledge_search',
        params: { topK: 6 },
      },
      {
        name: 'ai_completion',
        tool: 'ai_completion',
        params: {
          model: 'phi4',
          prompt: 'Summarize the key information from the knowledge base results. Be concise. Cite source document names where relevant. Format as bullet points with a brief intro paragraph.',
        },
      },
    ],
  },
}

export function getWorkflow(id: string): Workflow | undefined {
  return WORKFLOW_REGISTRY[id]
}

export function listWorkflows(): Workflow[] {
  return Object.values(WORKFLOW_REGISTRY)
}
