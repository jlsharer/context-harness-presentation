const atlasResearch05 = {
  'position': {
    'id': 'cre-2026',
    'sourceId': 'cre-2026',
    'sourceUrl': 'https://arxiv.org/html/2605.23170v1',
    'title': 'Positional Failures in Long-Context LLMs',
    'published': '2026-05-22',
    'checkedOn': '2026-11-11',
    'locators': {
      'worked': 'Table1 (middle derived as end + reported difference)',
      'questions': 'Table16 (end and middle reported directly)',
    },
    'metric': 'GSM8K task accuracy (%)',
    'sampleCount': 50,
    'tiers': ['8K', '32K', '64K'],
    'conditions': ['End task', 'Middle task'],
    'fillers': {
      'worked': 'Worked solutions',
      'questions': 'Unanswered questions',
    },
    'models': [
      {
        'model': 'DeepSeek-V4-Pro',
        'thinking': 'Vendor default; enabled',
        'worked': {
          '8K': [100, 98],
          '32K': [100, 98],
          '64K': [100, 96],
        },
        'questions': {
          '8K': [100, 68],
          '32K': [100, 84],
          '64K': [100, 82],
        },
      },
      {
        'model': 'MiMo-V2.5-Pro',
        'thinking': 'Vendor default; enabled',
        'worked': {
          '8K': [98, 90],
          '32K': [100, 84],
          '64K': [100, 68],
        },
        'questions': {
          '8K': [100, 44],
          '32K': [94, 50],
          '64K': [84, 30],
        },
      },
      {
        'model': 'Kimi-K2.6',
        'thinking': 'Vendor default; enabled',
        'worked': {
          '8K': [96, 98],
          '32K': [98, 96],
          '64K': [94, 96],
        },
        'questions': {
          '8K': [98, 78],
          '32K': [98, 60],
          '64K': [98, 64],
        },
      },
      {
        'model': 'GLM-5.1',
        'thinking': 'Vendor default; disabled',
        'worked': {
          '8K': [98, 98],
          '32K': [96, 98],
          '64K': [96, 98],
        },
        'questions': {
          '8K': [100, 64],
          '32K': [100, 60],
          '64K': [100, 50],
        },
      },
    ],
    'contextScope':
      'Reported8K/32K/64K context tiers, not exact provider-token counts for each prompt. Task ' +
      'embedded at middle or end of filler. No session trajectory.',
    'limits':
      '2026 preprint; n50 per condition. Math word problems, not software tasks. Task ' +
      'position, not answer-bearing document location. Provider reasoning defaults differ. A ' +
      'flat/reversed gap is allowed; no universal middle penalty or proven task-duplication repair.',
  },
  'signal': {
    'id': 'signal-2026',
    'sourceId': 'signal-2026',
    'sourceUrl': 'https://arxiv.org/html/2608.03297v1',
    'title': 'Distractor-Aware Truncation',
    'published': '2026-08-04',
    'checkedOn': '2026-11-11',
    'locator': 'Table1: BABILong full to25% paired change',
    'metric': 'Change in QA accuracy (percentage points)',
    'sampleCount': 240,
    'conditions': ['Blind middle-removal', 'Answer-preserving removal'],
    'models': [
      {
        'model': 'Claude Sonnet 4.6',
        'naive': -17.5,
        'aware': 10.4,
        'naiveCI': [-24.6, -10.4],
        'awareCI': [6.2, 15.0],
      },
      {
        'model': 'Claude Opus 4.7',
        'naive': -43.3,
        'aware': 0.8,
        'naiveCI': [-50.4, -35.8],
        'awareCI': [-3.3, 5.0],
      },
      {
        'model': 'GPT-5.5',
        'naive': -61.3,
        'aware': 1.7,
        'naiveCI': [-67.9, -54.2],
        'awareCI': [-1.3, 4.6],
      },
    ],
    'contextScope':
      '100%→25% of each input retained. BABILongqa1/qa2/qa3,0K/2K/8K/32K filler splits; paper ' +
      'reports realized median input about7Ktokens. This is not the1M-token cohort.',
    'limits':
      'Oracle signal selection uses dataset structure and gold labels. Not a production ' +
      'retriever or75%safe-trimming guarantee. Paired95%bootstrap CIs supplied. Absolute full ' +
      'baselines differ between protocol runs; deltas refer to each paired run.',
  },
};
