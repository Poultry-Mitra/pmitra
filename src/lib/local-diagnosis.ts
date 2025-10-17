
import type { DiagnoseChickenHealthInput, DiagnoseChickenHealthOutput } from '@/ai/flows/diagnose-chicken-health';

// A very basic, rule-based local diagnosis engine as a fallback.
export function localDiagnosis(input: DiagnoseChickenHealthInput): DiagnoseChickenHealthOutput {
  const { symptoms, flockAgeWeeks } = input;
  const symptomSet = new Set(symptoms.toLowerCase().split(',').map(s => s.trim()));

  const output: DiagnoseChickenHealthOutput = {
    possibleDiseases: [],
    treatmentPlan: [
      {
        step: "Isolate Sick Birds Immediately",
        details: "Separate any birds showing symptoms from the rest of the flock to prevent further spread of disease."
      },
      {
        step: "Provide Clean Water and Feed",
        details: "Ensure the isolated birds have easy access to fresh, clean water and feed. You can add electrolytes or vitamins to the water to support them."
      },
      {
        step: "Consult a Veterinarian",
        details: "This is a basic diagnosis. For accurate treatment and medication, it is crucial to consult a local poultry veterinarian."
      }
    ],
    preventativeMeasures: [
      "Maintain strict biosecurity.",
      "Ensure proper ventilation and dry litter.",
      "Follow a regular vaccination schedule.",
      "Provide balanced nutrition."
    ],
    biharSpecificAdvice: "यह एक बुनियादी निदान है। सटीक दवा और उपचार के लिए कृपया स्थानीय पशु चिकित्सक से संपर्क करें।"
  };

  // Rule 1: Coccidiosis
  if (symptomSet.has("bloody diarrhea") || symptomSet.has("खूनी दस्त")) {
    output.possibleDiseases.push({
      name: "Coccidiosis",
      likelihood: "High",
      reasoning: "Bloody diarrhea is a classic and primary symptom of Coccidiosis, a common parasitic disease in poultry."
    });
    output.treatmentPlan.splice(1, 0, {
        step: "Use Coccidiostats",
        details: "Administer anti-coccidial medication like Amprolium in the drinking water as per the manufacturer's instructions. Keep litter as dry as possible."
    });
  }

  // Rule 2: Gumboro (IBD)
  if (symptomSet.has("white/chalky diarrhea") && flockAgeWeeks >= 3 && flockAgeWeeks <= 7) {
    output.possibleDiseases.push({
      name: "Gumboro (Infectious Bursal Disease)",
      likelihood: "Medium",
      reasoning: "White, chalky diarrhea in flocks aged 3-7 weeks is a strong indicator of Gumboro disease."
    });
  }
  
  // Rule 3: Newcastle Disease (Ranikhet)
  if ((symptomSet.has("greenish diarrhea") || symptomSet.has("हरा दस्त")) && (symptomSet.has("difficulty breathing") || symptomSet.has("paralysis of legs, wings, or neck"))) {
     output.possibleDiseases.push({
      name: "Newcastle Disease (Ranikhet)",
      likelihood: "Medium",
      reasoning: "The combination of respiratory/neurological symptoms (difficulty breathing, paralysis) and greenish diarrhea points towards Newcastle Disease."
    });
  }

  if (output.possibleDiseases.length === 0) {
     output.possibleDiseases.push({
      name: "General Bacterial Infection or Stress",
      likelihood: "Low",
      reasoning: "Non-specific symptoms like lethargy and loss of appetite could be due to a variety of factors including stress or a mild bacterial infection."
    });
  }

  return output;
}
