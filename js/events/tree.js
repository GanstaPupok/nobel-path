// События-обёртки для древа решений
// Сама логика в js/tree.js. Здесь — только события-триггеры, которые показываются игроку.

export const treeEvents = [
  {
    treeKey:'science_vs_friends',
    when:{minAge:10,maxAge:16,stage:'child'}
  },
  {
    treeKey:'honest_vs_profit',
    when:{minAge:18,maxAge:25,stage:['uni','phd']}
  },
  {
    treeKey:'family_vs_career',
    when:{minAge:28,maxAge:35,stage:'career'}
  },
  {
    treeKey:'risk_vs_stable',
    when:{minAge:30,maxAge:40,stage:'career'}
  }
];