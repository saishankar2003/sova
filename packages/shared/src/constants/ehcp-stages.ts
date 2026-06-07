/**
 * Canonical EHCP (Education, Health and Care Plan) stages.
 * These define the journey a family goes through.
 */
export enum EHCPStage {
  /** Initial research and understanding EHCP */
  INITIAL_RESEARCH = 'initial_research',
  /** Requesting an EHC needs assessment */
  REQUEST = 'request',
  /** EHC needs assessment in progress */
  ASSESSMENT = 'assessment',
  /** Draft EHCP received and under review */
  DRAFT_PLAN = 'draft_plan',
  /** Final EHCP issued */
  FINAL_PLAN = 'final_plan',
  /** Implementation of the EHCP provisions */
  IMPLEMENTATION = 'implementation',
  /** Annual review of the EHCP */
  ANNUAL_REVIEW = 'annual_review',
  /** Transition planning (e.g., school changes, post-16) */
  TRANSITION = 'transition',
  /** Mediation or tribunal process */
  MEDIATION_TRIBUNAL = 'mediation_tribunal',
}

/** Display labels for each stage */
export const EHCP_STAGE_LABELS: Record<EHCPStage, string> = {
  [EHCPStage.INITIAL_RESEARCH]: 'Initial Research',
  [EHCPStage.REQUEST]: 'Request Assessment',
  [EHCPStage.ASSESSMENT]: 'Needs Assessment',
  [EHCPStage.DRAFT_PLAN]: 'Draft Plan',
  [EHCPStage.FINAL_PLAN]: 'Final Plan',
  [EHCPStage.IMPLEMENTATION]: 'Implementation',
  [EHCPStage.ANNUAL_REVIEW]: 'Annual Review',
  [EHCPStage.TRANSITION]: 'Transition',
  [EHCPStage.MEDIATION_TRIBUNAL]: 'Mediation / Tribunal',
};

/** Ordered list of stages for the timeline */
export const EHCP_STAGE_ORDER: EHCPStage[] = [
  EHCPStage.INITIAL_RESEARCH,
  EHCPStage.REQUEST,
  EHCPStage.ASSESSMENT,
  EHCPStage.DRAFT_PLAN,
  EHCPStage.FINAL_PLAN,
  EHCPStage.IMPLEMENTATION,
  EHCPStage.ANNUAL_REVIEW,
  EHCPStage.TRANSITION,
  EHCPStage.MEDIATION_TRIBUNAL,
];

/** Stage descriptions for the EHCP intro page */
export const EHCP_STAGE_DESCRIPTIONS: Record<EHCPStage, string> = {
  [EHCPStage.INITIAL_RESEARCH]:
    'Learn about EHCPs, understand your child\'s needs, and gather supporting evidence.',
  [EHCPStage.REQUEST]:
    'Submit a formal request to your local authority for an Education, Health and Care needs assessment.',
  [EHCPStage.ASSESSMENT]:
    'The local authority conducts assessments involving education, health, and social care professionals.',
  [EHCPStage.DRAFT_PLAN]:
    'Review the draft EHCP to ensure it accurately reflects your child\'s needs and required provisions.',
  [EHCPStage.FINAL_PLAN]:
    'The final EHCP is issued. This is a legally binding document outlining support for your child.',
  [EHCPStage.IMPLEMENTATION]:
    'Work with your child\'s school and other providers to ensure the EHCP provisions are in place.',
  [EHCPStage.ANNUAL_REVIEW]:
    'The EHCP is reviewed annually to check progress and update support as needed.',
  [EHCPStage.TRANSITION]:
    'Plan for key transitions such as changing schools or moving to post-16 education.',
  [EHCPStage.MEDIATION_TRIBUNAL]:
    'If you disagree with decisions about your child\'s EHCP, explore mediation or the SEND Tribunal.',
};
