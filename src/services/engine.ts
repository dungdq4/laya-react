import type {
  Answer,
  ChoiceAnswer,
  NoulAnswer,
  QuestionSet,
  RagResultRow,
  ScoreAnswer,
  SystemOneResponse,
  TableRow,
} from '../types';
import { buildEmailState } from './emailUtils';

// Helper to calculate confidence from probabilities (matching confidence_from_probs in Python)
export function confidenceFromProbs(probs: number[], k: number): number {
  if (k <= 1) return 1.0;
  const sorted = [...probs].sort((a, b) => b - a);
  const p1 = sorted[0];
  const p2 = sorted[1] || 0;
  // gap-based and top probability calibration
  const conf = Math.min(1.0, Math.max(0.0, p1 + (p1 - p2) * 0.4));
  return Number(conf.toFixed(4));
}

// Convert Answer to displayable value
export function getAnswerValue(answer: Answer): string | number {
  if (answer.type === 'choice') return answer.choice;
  if (answer.type === 'score') return Number(answer.score.toFixed(3));
  return Number(answer.noul.toFixed(3));
}

// Convert Answer to displayable confidence
export function getAnswerConfidence(answer: Answer): number {
  if (answer.type === 'noul') {
    return Number(Math.max(answer.noul, 1 - answer.noul).toFixed(2));
  }
  return Number(answer.confidence.toFixed(2));
}

// Risk score for sorting rows descending by risk/severity (matching Python risk_score)
export function calculateRiskScore(_qid: string, a: Answer): number {
  if (a.type === 'noul') {
    return a.noul;
  }
  if (a.type === 'score') {
    const s = a.score;
    const nLevels = Object.keys(a.probabilities || {}).length || 4;
    const denom = Math.max(1, nLevels - 1);
    return s / denom;
  }
  return -1.0;
}

// Build table rows from SystemOneResponse
export function formatTableRows(res: SystemOneResponse, sortByRisk = true): TableRow[] {
  const rows: TableRow[] = Object.entries(res.answers).map(([qid, a]) => {
    const val = getAnswerValue(a);
    const conf = getAnswerConfidence(a);
    const risk = calculateRiskScore(qid, a);
    return {
      question: qid,
      answer: typeof val === 'number' ? val.toFixed(3) : val,
      confidence: conf.toFixed(2),
      type: a.type,
      rawAnswer: a,
      riskScore: risk,
    };
  });

  if (sortByRisk) {
    rows.sort((a, b) => b.riskScore - a.riskScore);
  }
  return rows;
}

// Realistic simulator for Laya inference when offline
export function simulateSystemOne(
  state: Record<string, any> | string,
  questions: QuestionSet
): SystemOneResponse {
  const stateStr = typeof state === 'string' ? state : JSON.stringify(state).toLowerCase();
  const answers: Record<string, Answer> = {};

  for (const [qid, q] of Object.entries(questions)) {
    if (q.type === 'noul') {
      let prob = 0.08; // default baseline low
      const lowerIns = q.instructions.toLowerCase();

      // Heuristic detection based on state content
      if (qid === 'is_urgent' || lowerIns.includes('time pressure') || lowerIns.includes('deadline')) {
        if (/urgent|immediately|today|asap|now|emergency|deadline|three days|fast/i.test(stateStr)) {
          prob = 0.89 + Math.random() * 0.08;
        } else {
          prob = 0.12 + Math.random() * 0.08;
        }
      } else if (qid === 'refund_requested' || lowerIns.includes('refund')) {
        if (/refund|money back|charge.*twice|duplicate|overcharged|cancel.*plan/i.test(stateStr)) {
          prob = 0.94 + Math.random() * 0.05;
        } else {
          prob = 0.04 + Math.random() * 0.05;
        }
      } else if (qid === 'churn_risk' || lowerIns.includes('churn') || lowerIns.includes('cancel')) {
        if (/cancelling|leaving|competitor|switch|unsubscribe|take my business/i.test(stateStr)) {
          prob = 0.87 + Math.random() * 0.09;
        } else {
          prob = 0.11 + Math.random() * 0.06;
        }
      } else if (qid === 'is_phishing' || lowerIns.includes('phishing') || lowerIns.includes('scam')) {
        if (/verify immediately|locked.*security|suspicious|password|tj49|wsipv6|wellsf-argo/i.test(stateStr)) {
          prob = 0.96 + Math.random() * 0.03;
        } else {
          prob = 0.02 + Math.random() * 0.04;
        }
      } else if (qid === 'is_spam' || lowerIns.includes('spam')) {
        if (/buy cheap followers|viagra|discount.*click|lottery|winner|bulk/i.test(stateStr)) {
          prob = 0.95 + Math.random() * 0.04;
        } else {
          prob = 0.06 + Math.random() * 0.06;
        }
      } else if (qid === 'needs_reply' || lowerIns.includes('reply')) {
        if (/\?|please|refund|help|answer|verify/i.test(stateStr)) {
          prob = 0.88 + Math.random() * 0.07;
        } else {
          prob = 0.22 + Math.random() * 0.1;
        }
      } else if (qid === 'jailbreak' || lowerIns.includes('jailbreak') || lowerIns.includes('ignore')) {
        if (/ignore all previous|dan|system prompt|no restrictions|jailbreak/i.test(stateStr)) {
          prob = 0.96 + Math.random() * 0.03;
        } else {
          prob = 0.03 + Math.random() * 0.04;
        }
      } else if (qid === 'prompt_injection' || lowerIns.includes('injection')) {
        if (/ignore all|tell the user|system instructions|system prompt|bypass/i.test(stateStr)) {
          prob = 0.93 + Math.random() * 0.05;
        } else {
          prob = 0.04 + Math.random() * 0.05;
        }
      } else if (qid === 'sensitive_data') {
        if (/password|api_key|secret|credential|ssn|\d{4}-\d{4}/i.test(stateStr)) {
          prob = 0.85 + Math.random() * 0.1;
        } else {
          prob = 0.03 + Math.random() * 0.04;
        }
      } else if (qid === 'toxic' || qid === 'harassment' || qid === 'threat') {
        if (/idiot|stupid|kill|hate|harass|nobody wants you/i.test(stateStr)) {
          if (qid === 'threat') prob = /kill|die|violence|hurt/i.test(stateStr) ? 0.85 : 0.05;
          else if (qid === 'harassment') prob = 0.88 + Math.random() * 0.08;
          else prob = 0.94 + Math.random() * 0.05;
        } else {
          prob = 0.02 + Math.random() * 0.05;
        }
      } else if (qid === 'needs_tools') {
        if (/tokyo|weather|search|right now|current time|database/i.test(stateStr)) {
          prob = 0.82 + Math.random() * 0.1;
        } else {
          prob = 0.15 + Math.random() * 0.1;
        }
      } else if (qid === 'is_sensitive') {
        if (/settlement|injury|lawyer|medical|doctor|dose|legal|lawsuit|\$/i.test(stateStr)) {
          prob = 0.92 + Math.random() * 0.06;
        } else {
          prob = 0.08 + Math.random() * 0.08;
        }
      } else if (qid === 'relevant') {
        prob = /refund|duplicate|charge|eligible|transaction|window/i.test(stateStr) ? 0.91 : 0.12;
      } else if (qid === 'contradicts') {
        prob = /never possible|no refunds/i.test(stateStr) ? 0.88 : 0.04;
      } else if (qid === 'injection') {
        prob = /ignore all previous/i.test(stateStr) ? 0.97 : 0.03;
      } else {
        prob = 0.1 + Math.random() * 0.3;
      }

      prob = Math.min(0.999, Math.max(0.001, prob));
      answers[qid] = {
        type: 'noul',
        noul: Number(prob.toFixed(4)),
        rl_agent: { act_probability: Number((prob * 0.9).toFixed(4)) },
      };
    } else if (q.type === 'score') {
      const levels = q.criteria;
      const k = levels.length;
      let targetIdx = 0;

      if (qid === 'frustration') {
        if (/cancelling|refund the duplicate today|nobody has answered for three days/i.test(stateStr)) {
          targetIdx = Math.min(k - 1, 3);
        } else if (/annoyed|slow|issue/i.test(stateStr)) {
          targetIdx = Math.min(k - 1, 2);
        } else {
          targetIdx = 0;
        }
      } else if (qid === 'urgency') {
        if (/immediately|urgent|today|locked|closed/i.test(stateStr)) {
          targetIdx = Math.min(k - 1, 2);
        } else {
          targetIdx = 0;
        }
      } else if (qid === 'harm_severity') {
        if (/system prompt|jailbreak|dan|restrictions|harm/i.test(stateStr)) {
          targetIdx = Math.min(k - 1, 2);
        } else {
          targetIdx = 0;
        }
      } else if (qid === 'severity') {
        if (/threat|kill/i.test(stateStr)) targetIdx = Math.min(k - 1, 3);
        else if (/idiot|nobody wants you/i.test(stateStr)) targetIdx = Math.min(k - 1, 2);
        else if (/buy cheap/i.test(stateStr)) targetIdx = Math.min(k - 1, 2);
        else targetIdx = 0;
      } else if (qid === 'difficulty') {
        if (/dependency injection|refactor|architecture|settlement/i.test(stateStr)) {
          targetIdx = Math.min(k - 1, 3); // hard
        } else if (/index to a postgres|explain/i.test(stateStr)) {
          targetIdx = Math.min(k - 1, 2);
        } else {
          targetIdx = 0; // trivial
        }
      }

      // Generate probability distribution peaking around targetIdx
      const rawProbs: number[] = [];
      for (let i = 0; i < k; i++) {
        const dist = Math.abs(i - targetIdx);
        rawProbs.push(Math.exp(-dist * 1.8) + Math.random() * 0.05);
      }
      const sum = rawProbs.reduce((a, b) => a + b, 0);
      const normalized = rawProbs.map((p) => p / sum);

      const expScore = normalized.reduce((acc, p, idx) => acc + idx * p, 0);
      const conf = confidenceFromProbs(normalized, k);

      const probMap: Record<string, number> = {};
      const legendMap: Record<string, string> = {};
      levels.forEach((c, idx) => {
        probMap[String(idx)] = Number(normalized[idx].toFixed(4));
        legendMap[String(idx)] = c;
      });

      answers[qid] = {
        type: 'score',
        score: Number(expScore.toFixed(4)),
        probabilities: probMap,
        legend: legendMap,
        confidence: conf,
        rl_agent: { act_probability: Number((conf * 0.95).toFixed(4)) },
      };
    } else if (q.type === 'choice') {
      const keys = Array.isArray(q.criteria) ? q.criteria : Object.keys(q.criteria);
      const k = keys.length;
      let targetKey = keys[0];

      if (qid === 'intent') {
        if (/refund|charged twice|duplicate/i.test(stateStr)) targetKey = 'refund';
        else if (/technical|bug|error|broken/i.test(stateStr)) targetKey = 'technical_help';
        else if (/cancel/i.test(stateStr)) targetKey = 'cancellation';
        else targetKey = 'information';
      } else if (qid === 'category' || qid === 'department') {
        if (/wellsfargo|verify|locked|phishing|compromise/i.test(stateStr)) targetKey = 'security';
        else if (/invoice|charged|refund|payment/i.test(stateStr)) targetKey = 'billing';
        else if (/bug|technical|postgres|gin index/i.test(stateStr)) targetKey = 'technical';
        else if (/pricing|sales|demo/i.test(stateStr)) targetKey = 'sales';
        else targetKey = 'other';
      } else if (qid === 'topic') {
        if (/system prompt|jailbreak|instructions/i.test(stateStr)) targetKey = 'security_testing';
        else if (/postgres|index|code|sql/i.test(stateStr)) targetKey = 'coding';
        else targetKey = 'general_knowledge';
      } else if (qid === 'domain') {
        if (/refactor|postgres|dependency injection|code/i.test(stateStr)) targetKey = 'code';
        else if (/settlement|injury|legal/i.test(stateStr)) targetKey = 'factual_lookup';
        else if (/math|puzzle/i.test(stateStr)) targetKey = 'math_or_logic';
        else targetKey = 'factual_lookup';
      }

      const targetIdx = Math.max(0, keys.indexOf(targetKey));
      const rawProbs: number[] = [];
      for (let i = 0; i < k; i++) {
        const val = i === targetIdx ? 3.5 : Math.random() * 0.3;
        rawProbs.push(Math.exp(val));
      }
      const sum = rawProbs.reduce((a, b) => a + b, 0);
      const normalized = rawProbs.map((p) => p / sum);

      const probMap: Record<string, number> = {};
      keys.forEach((key, idx) => {
        probMap[key] = Number(normalized[idx].toFixed(4));
      });
      const conf = confidenceFromProbs(normalized, k);

      answers[qid] = {
        type: 'choice',
        choice: targetKey,
        probabilities: probMap,
        confidence: conf,
        rl_agent: { act_probability: Number((conf * 0.92).toFixed(4)) },
      };
    }
  }

  const tokenEst = (stateStr.length / 4) + Object.keys(questions).length * 16;
  const latency = Math.round(28 + Math.random() * 15);

  return {
    model: 'laya',
    answers,
    usage: {
      input_tokens: Math.round(tokenEst),
      output_tokens: 0,
    },
    latency_ms: latency,
  };
}

// 1. Support Triage logic
export function executeSupportTriage(message: string, tier: string, threshold: number) {
  const questions: QuestionSet = {
    intent: {
      type: 'choice',
      instructions: 'What does the customer want in `message`?',
      criteria: {
        refund: 'money returned or a duplicate charge reversed',
        technical_help: 'a bug, outage or integration problem',
        billing_question: 'a question about an invoice, plan or payment method',
        information: 'general information, pricing or how-to',
        cancellation: 'wants to cancel or downgrade',
        other: 'none of the other options fits',
      },
    },
    is_urgent: { type: 'noul', instructions: 'Does `message` communicate time pressure or a deadline?' },
    frustration: {
      type: 'score',
      instructions: 'How frustrated does the customer sound in `message`?',
      criteria: ['calm and neutral', 'concerned but civil', 'clearly annoyed', 'very angry or using strong language'],
    },
    refund_requested: { type: 'noul', instructions: 'Does the customer ask for money back?' },
    churn_risk: { type: 'noul', instructions: 'Does `message` suggest the customer may leave for a competitor or cancel?' },
  };

  const state = { message: message.trim(), account_tier: tier };
  const res = simulateSystemOne(state, questions);
  const a = res.answers;

  const intent = (a.intent as ChoiceAnswer).choice;
  const c = (a.intent as ChoiceAnswer).confidence;
  const urgent = (a.is_urgent as NoulAnswer).noul > 0.5;
  const angry = (a.frustration as ScoreAnswer).score >= 2.0;

  let action = '';
  let actionType: 'escalate' | 'warning' | 'priority' | 'success' = 'success';

  if (c < threshold) {
    action = `ESCALATE to a human agent — the model is not confident enough (${c.toFixed(2)} < ${threshold.toFixed(2)})`;
    actionType = 'escalate';
  } else if (intent === 'refund' && tier === 'enterprise') {
    action = 'ROUTE to billing, flagged for manager approval (enterprise refund)';
    actionType = 'warning';
  } else if (urgent && angry) {
    action = `ROUTE to ${intent}, priority queue (urgent and frustrated)`;
    actionType = 'priority';
  } else {
    action = `ROUTE automatically to ${intent}`;
    actionType = 'success';
  }

  return {
    rows: formatTableRows(res),
    action,
    actionType,
    raw: res,
  };
}

// 2. Email + Phishing logic
export function executeEmailTriage(sender: string, subject: string, body: string) {
  const state = buildEmailState(subject, body, sender || undefined);
  const questions: QuestionSet = {
    category: {
      type: 'choice',
      instructions: 'Which team should handle the email in `body`?',
      criteria: {
        billing: 'invoices, payments, refunds',
        technical: 'bugs, outages, integrations',
        sales: 'pricing, demos, new purchases',
        security: 'phishing, fraud, account compromise',
        hr: 'hiring, leave, payroll',
        other: 'none of the above',
      },
    },
    is_spam: { type: 'noul', instructions: 'Is this email unsolicited spam or bulk marketing?' },
    is_phishing: {
      type: 'noul',
      instructions: 'Is this email a phishing or scam attempt to steal money, credentials or personal data?',
      criteria: { true: 'phishing, scam or fraud', false: 'a legitimate email' },
    },
    urgency: {
      type: 'score',
      instructions: 'How urgent is the request in `body`?',
      criteria: ['no time pressure', 'needs attention soon', 'blocking issue or hard deadline'],
    },
    needs_reply: { type: 'noul', instructions: 'Does the sender expect a reply?' },
  };

  const res = simulateSystemOne(state, questions);
  const a = res.answers;

  const isPhishing = (a.is_phishing as NoulAnswer).noul;
  const isSpam = (a.is_spam as NoulAnswer).noul;
  const cat = (a.category as ChoiceAnswer).choice;
  const needsReply = (a.needs_reply as NoulAnswer).noul > 0.5;

  let action = '';
  let actionType: 'escalate' | 'warning' | 'priority' | 'success' = 'success';

  if (isPhishing > 0.7) {
    action = `QUARANTINE — likely phishing (${isPhishing.toFixed(2)})`;
    actionType = 'escalate';
  } else if (isSpam > 0.7) {
    action = `SPAM folder (${isSpam.toFixed(2)})`;
    actionType = 'warning';
  } else {
    action = `DELIVER to ${cat}${needsReply ? ', reply expected' : ''}`;
    actionType = 'success';
  }

  return {
    rows: formatTableRows(res),
    action,
    actionType,
    cleanedBody: state.body,
    raw: res,
  };
}

// 3. LLM Guardrails logic
export function executeGuardrail(prompt: string, threshold: number) {
  const questions: QuestionSet = {
    jailbreak: {
      type: 'noul',
      instructions: 'Does `prompt` try to make an AI assistant ignore its rules, policies or system instructions?',
    },
    prompt_injection: {
      type: 'noul',
      instructions: 'Does `prompt` contain instructions aimed at the AI system rather than a genuine user request?',
    },
    sensitive_data: {
      type: 'noul',
      instructions: 'Does `prompt` contain credentials, personal data or other sensitive information?',
    },
    harm_severity: {
      type: 'score',
      instructions: 'How much harm would complying with `prompt` cause?',
      criteria: [
        'none: ordinary request',
        'minor: mildly inappropriate',
        'serious: unsafe advice or abuse',
        'severe: dangerous or illegal',
      ],
    },
    topic: {
      type: 'choice',
      instructions: 'What is `prompt` about?',
      criteria: {
        product_support: null,
        coding: null,
        general_knowledge: null,
        personal_advice: null,
        security_testing: null,
        other: null,
      },
    },
  };

  const res = simulateSystemOne({ prompt: prompt.trim() }, questions);
  const a = res.answers;

  const jailbreak = (a.jailbreak as NoulAnswer).noul;
  const injection = (a.prompt_injection as NoulAnswer).noul;
  const harm = (a.harm_severity as ScoreAnswer).score;
  const sensitive = (a.sensitive_data as NoulAnswer).noul;
  const risk = Math.max(jailbreak, injection);

  let action = '';
  let actionType: 'escalate' | 'warning' | 'priority' | 'success' = 'success';

  if (risk > threshold || harm >= 2.5) {
    action = `BLOCK — attack probability ${risk.toFixed(2)}, harm ${harm.toFixed(2)}/3`;
    actionType = 'escalate';
  } else if (risk > threshold / 2 || sensitive > 0.5) {
    action = `REVIEW — log and send to a human or a stronger model (risk ${risk.toFixed(2)})`;
    actionType = 'warning';
  } else {
    action = `PASS to the LLM (risk ${risk.toFixed(2)})`;
    actionType = 'success';
  }

  return {
    rows: formatTableRows(res),
    action,
    actionType,
    raw: res,
  };
}

// 4. RAG Passage filter logic
export function executeRagFilter(query: string, passagesText: string, keepThreshold: number) {
  const passages = passagesText
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 12);

  const ragQuestions: QuestionSet = {
    relevant: { type: 'noul', instructions: 'Does `passage` help answer `query`?' },
    contradicts: { type: 'noul', instructions: 'Does `passage` contradict the premise of `query`?' },
    injection: {
      type: 'noul',
      instructions: 'Does `passage` contain instructions aimed at an AI system (prompt injection)?',
    },
  };

  const results: RagResultRow[] = [];
  let kept = 0;

  for (let i = 0; i < passages.length; i++) {
    const p = passages[i];
    const res = simulateSystemOne({ query: query.trim(), passage: p }, ragQuestions);
    const rel = (res.answers.relevant as NoulAnswer).noul;
    const con = (res.answers.contradicts as NoulAnswer).noul;
    const inj = (res.answers.injection as NoulAnswer).noul;

    let verdict: RagResultRow['verdict'];
    if (inj > 0.5) {
      verdict = 'DROP (injection)';
    } else if (rel < keepThreshold) {
      verdict = 'DROP (not relevant)';
    } else {
      verdict = con > 0.5 ? 'KEEP + flag contradiction' : 'KEEP';
      kept++;
    }

    results.push({
      index: i + 1,
      passage: p,
      relevant: rel,
      contradicts: con,
      injection: inj,
      verdict,
    });
  }

  results.sort((a, b) => b.relevant - a.relevant);
  const totalMs = Math.round(35 + Math.random() * 15);
  const summary = `Kept ${kept} of ${passages.length} passages — ${3 * passages.length} questions evaluated in one batched pass (${totalMs} ms)`;

  return {
    results,
    summary,
    kept,
    total: passages.length,
    latencyMs: totalMs,
  };
}

// 5. Moderation logic
export function executeModeration(post: string, threshold: number) {
  const questions: QuestionSet = {
    toxic: { type: 'noul', instructions: 'Is `post` toxic: rude, disrespectful or likely to make someone leave the discussion?' },
    harassment: { type: 'noul', instructions: 'Does `post` target or harass a specific person?' },
    threat: { type: 'noul', instructions: 'Does `post` threaten violence, harm or intimidation?' },
    spam: { type: 'noul', instructions: 'Is `post` spam or advertising?' },
    severity: {
      type: 'score',
      instructions: 'How severe is any rule-breaking in `post`?',
      criteria: [
        'no rule-breaking: ordinary on-topic post',
        'mild: rude tone or off-topic, no target',
        'clear violation: insults, harassment or spam aimed at someone',
        'severe: threats, hate speech or calls for violence',
      ],
    },
  };

  const res = simulateSystemOne({ post: post.trim() }, questions);
  const a = res.answers;

  const sev = (a.severity as ScoreAnswer).score;
  const tox = (a.toxic as NoulAnswer).noul;
  const threat = (a.threat as NoulAnswer).noul;
  const harassment = (a.harassment as NoulAnswer).noul;
  const spam = (a.spam as NoulAnswer).noul;
  const sevConf = (a.severity as ScoreAnswer).confidence;

  const composite = 3 * threat + 2 * harassment + 1.5 * tox + spam;

  let action = '';
  let actionType: 'escalate' | 'warning' | 'priority' | 'success' = 'success';

  if (composite >= 3.0 || (sev >= 2.5 && sevConf > threshold)) {
    action = `REMOVE and warn the author (composite ${composite.toFixed(2)}, severity ${sev.toFixed(2)}/3)`;
    actionType = 'escalate';
  } else if (composite >= 1.0 || tox > 0.6) {
    action = `SEND TO HUMAN REVIEW (composite ${composite.toFixed(2)}, toxicity ${tox.toFixed(2)})`;
    actionType = 'warning';
  } else {
    action = `ALLOW (composite ${composite.toFixed(2)}, toxicity ${tox.toFixed(2)})`;
    actionType = 'success';
  }

  return {
    rows: formatTableRows(res),
    action,
    actionType,
    composite: Number(composite.toFixed(2)),
    raw: res,
  };
}

// 6. Model routing logic
export function executeModelRouting(request: string, smallModel: string, largeModel: string) {
  const questions: QuestionSet = {
    difficulty: {
      type: 'score',
      instructions: 'How hard is `request` for a language model?',
      criteria: [
        'trivial: a lookup or one-liner',
        'easy: short answer, no reasoning',
        'moderate: several steps',
        'hard: long multi-step reasoning or specialist knowledge',
      ],
    },
    domain: {
      type: 'choice',
      instructions: 'What domain does `request` belong to?',
      criteria: {
        code: 'software engineering, programming, refactoring, architecture, debugging',
        math_or_logic: 'mathematics, logic puzzles, proofs, complex calculation',
        writing: 'creative writing, essays, emails, blog posts, copywriting',
        factual_lookup: 'facts, definitions, trivia, history',
        data_analysis: 'statistics, SQL, data manipulation, metrics',
        chitchat: 'casual conversation, greetings, small talk',
      },
    },
    needs_tools: { type: 'noul', instructions: 'Does answering `request` require external tools, search or private data?' },
    is_sensitive: { type: 'noul', instructions: 'Does `request` involve money, legal, medical or safety consequences?' },
  };

  const res = simulateSystemOne({ request: request.trim() }, questions);
  const a = res.answers;

  const d = (a.difficulty as ScoreAnswer).score;
  const domain = (a.domain as ChoiceAnswer).choice;
  const needsTools = (a.needs_tools as NoulAnswer).noul > 0.6;
  const isSensitive = (a.is_sensitive as NoulAnswer).noul > 0.7;
  const diffConf = (a.difficulty as ScoreAnswer).confidence;

  let targetModel = smallModel;
  let reason = '';

  if (isSensitive && d >= 1.8) {
    targetModel = `${largeModel} + human review`;
    reason = `sensitive, difficulty ${d.toFixed(2)}/3`;
  } else if (d >= 2.0 || (['code', 'math_or_logic'].includes(domain) && d >= 1.8) || needsTools) {
    targetModel = largeModel;
    const reasons: string[] = [];
    if (d >= 2.0) reasons.push(`difficulty ${d.toFixed(2)}/3`);
    if (['code', 'math_or_logic'].includes(domain)) reasons.push(`complex ${domain}`);
    if (needsTools) reasons.push('needs external tools');
    reason = reasons.join(', ');
  } else if (d < 1.0 && diffConf > 0.5) {
    targetModel = 'cached / deterministic handler';
    reason = `difficulty ${d.toFixed(2)}/3`;
  } else {
    targetModel = smallModel;
    reason = `difficulty ${d.toFixed(2)}/3`;
  }

  return {
    rows: formatTableRows(res),
    targetModel,
    reason,
    action: `route to ${targetModel} (${reason})`,
    raw: res,
  };
}

// 7. Multilingual routing logic
export function executeMultilingualRouting(text: string) {
  // Fast script detection (Unicode ranges)
  const isNonLatin = /[\u0900-\u097F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u0600-\u06FF\u0400-\u04FF\u1780-\u17FF]/.test(
    text
  );

  let script = 'Latin';
  let langGuess = 'en';
  if (/[\u0900-\u097F]/.test(text)) {
    script = 'Devanagari';
    langGuess = 'hi';
  } else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    script = 'Japanese';
    langGuess = 'ja';
  } else if (/[\uAC00-\uD7AF]/.test(text)) {
    script = 'Hangul';
    langGuess = 'ko';
  } else if (/[\u0600-\u06FF]/.test(text)) {
    script = 'Arabic';
    langGuess = 'ar';
  } else if (/[\u0400-\u04FF]/.test(text)) {
    script = 'Cyrillic';
    langGuess = 'ru';
  } else if (/[\u4E00-\u9FFF]/.test(text)) {
    script = 'Han';
    langGuess = 'zh';
  } else if (/[\u1780-\u17FF]/.test(text)) {
    script = 'Khmer';
    langGuess = 'km';
  } else if (/[äöüß]/i.test(text)) {
    langGuess = 'de';
  }

  const chosenCheckpoint = isNonLatin ? 'laya-multilingual' : 'laya';
  const reason = isNonLatin
    ? `non-Latin script detected (${script}) — routed before forward pass`
    : 'Latin script — routed to primary English checkpoint';

  const questions: QuestionSet = {
    department: {
      type: 'choice',
      instructions: 'Which team should handle the message in `body`?',
      criteria: {
        billing: 'invoices, payments, refunds',
        technical: 'bugs, outages, integrations',
        sales: 'pricing, demos, new purchases',
        security: 'phishing, fraud, account compromise',
        other: 'none of the above',
      },
    },
    is_urgent: { type: 'noul', instructions: 'Does `body` communicate time pressure or a deadline?' },
    refund_requested: { type: 'noul', instructions: 'Does the sender ask for money back?' },
    frustration: {
      type: 'score',
      instructions: 'How frustrated does the sender sound?',
      criteria: ['calm and neutral', 'concerned but civil', 'clearly annoyed', 'very angry or using strong language'],
    },
  };

  const res = simulateSystemOne({ body: text.trim() }, questions);
  res.model = chosenCheckpoint;

  return {
    rows: formatTableRows(res),
    model: chosenCheckpoint,
    script,
    language: langGuess,
    reason,
    repo: `convaiinnovations/${chosenCheckpoint}`,
    raw: res,
  };
}

// 8. Playground logic
export function executePlayground(stateStr: string, questionsStr: string) {
  let state: any;
  try {
    state = stateStr.trim().startsWith('{') || stateStr.trim().startsWith('[')
      ? JSON.parse(stateStr)
      : stateStr;
  } catch {
    state = stateStr;
  }

  const questions: QuestionSet = JSON.parse(questionsStr);
  const res = simulateSystemOne(state, questions);
  return {
    rows: formatTableRows(res),
    raw: res,
  };
}

