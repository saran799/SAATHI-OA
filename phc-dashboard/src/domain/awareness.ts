export interface Article { id: string; title: string; minutes: number; summary: string; points: string[] }
export const ARTICLES: Article[] = [
  { id: 'what', title: 'What is osteoarthritis?', minutes: 2, summary: 'A common joint condition where cartilage gradually wears down.',
    points: ['Most common in knees, hips, hands and spine.', 'More common after age 45.', 'Early care can reduce pain and keep people active.'] },
  { id: 'signs', title: 'Early signs to watch for', minutes: 2, summary: 'Small changes often appear before serious limitation.',
    points: ['Pain during activity that eases with rest.', 'Morning stiffness lasting under 30 minutes.', 'Grinding or clicking when moving the joint.', 'Difficulty squatting or climbing stairs.'] },
  { id: 'care', title: 'Everyday joint care', minutes: 3, summary: 'Simple habits that protect joints.',
    points: ['Regular gentle movement is better than rest.', 'Maintain a healthy weight — each kilo less means less load on knees.', 'Use a chair instead of floor sitting where possible.', 'Supportive footwear matters on uneven paths.'] },
  { id: 'when', title: 'When to visit the PHC', minutes: 1, summary: 'Know when screening should become a clinical visit.',
    points: ['Pain that wakes the person at night.', 'A joint that is hot, red or suddenly swollen.', 'Sudden inability to bear weight.', 'Symptoms worsening despite home care.'] },
]
