import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const ACTIVITY_PROMPTS = {
  QUIZ: `You are an expert at creating engaging quiz questions. Create a quiz based on the following requirements.

Requirements:
- Title: {title}
- Description: {description}
- Instructions: {prompt}
- Program Context: {program_context}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ],
  "passingScore": 3,
  "timeLimit": 300
}

Guidelines:
- Create 3-7 questions unless specified otherwise
- Make questions clear and specific
- Ensure options are plausible but only one is clearly correct
- Include brief explanations for learning
- Set appropriate passing score (usually 60-70% of total)
- Set reasonable time limit in seconds`,

  SURVEY: `You are an expert at creating user surveys. Create a survey based on the following requirements.

Requirements:
- Title: {title}
- Description: {description}
- Instructions: {prompt}
- Program Context: {program_context}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "multiple_choice",
      "options": ["Option 1", "Option 2", "Option 3"],
      "required": true
    },
    {
      "id": "q2",
      "question": "Question text here",
      "type": "rating",
      "scale": 5,
      "required": true
    },
    {
      "id": "q3",
      "question": "Question text here",
      "type": "text",
      "required": false
    }
  ]
}

Guidelines:
- Create 3-8 questions unless specified otherwise
- Mix question types: multiple_choice, rating, text, yes_no
- Make questions clear and actionable
- Mark important questions as required
- Use 1-5 or 1-10 rating scales
- Include open-ended questions for detailed feedback`,

  GAME: `You are an expert game designer. Create an interactive game based on the following requirements.

Requirements:
- Title: {title}
- Description: {description}
- Instructions: {prompt}
- Program Context: {program_context}

Return a JSON object with this exact structure:
{
  "gameType": "trivia",
  "rules": "Game rules and instructions",
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "points": 10
    }
  ],
  "timePerQuestion": 30,
  "maxAttempts": 3
}

Guidelines:
- Choose appropriate game type (trivia, memory, word, matching)
- Create engaging questions with point values
- Set reasonable time limits
- Include clear rules and instructions
- Make it fun but educational`,

  DEMO: `You are an expert at creating product demonstrations. Create an interactive demo based on the following requirements.

Requirements:
- Title: {title}
- Description: {description}
- Instructions: {prompt}
- Program Context: {program_context}

Return a JSON object with this exact structure:
{
  "steps": [
    {
      "id": "step1",
      "title": "Step Title",
      "content": "Step description and instructions",
      "media": null,
      "action": "Click to continue"
    }
  ],
  "completionCriteria": "What defines completion",
  "estimatedDuration": 5
}

Guidelines:
- Create 3-8 clear steps
- Make each step actionable
- Include helpful descriptions
- Set realistic duration in minutes
- Focus on key features or benefits`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, prompt, program_id } = body

    // Validate required fields
    if (!type || !title || !prompt || !program_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get program context
    const supabase = createServerSupabaseClient()
    const { data: program } = await supabase
      .from('programs')
      .select('name, handle')
      .eq('id', program_id)
      .single()

    const program_context = program ? `${program.name} (${program.handle})` : 'Unknown program'

    // Get the appropriate prompt template
    const promptTemplate = ACTIVITY_PROMPTS[type as keyof typeof ACTIVITY_PROMPTS]
    if (!promptTemplate) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity type' },
        { status: 400 }
      )
    }

    // Fill in the template
    const finalPrompt = promptTemplate
      .replace('{title}', title)
      .replace('{description}', description || '')
      .replace('{prompt}', prompt)
      .replace('{program_context}', program_context)

    console.log('🤖 Generating activity with AI')
    console.log('Type:', type)
    console.log('Title:', title)
    console.log('Prompt length:', finalPrompt.length)

    // For now, we'll generate mock data since we don't have Claude API
    // In production, you would call Claude API here
    const mockGeneration = generateMockActivity(type, title, prompt)

    console.log('✅ AI generation complete')

    return NextResponse.json({
      success: true,
      data: mockGeneration,
      message: 'Activity generated successfully'
    })

  } catch (error: any) {
    console.error('AI generation failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Mock AI generation for testing
function generateMockActivity(type: string, title: string, prompt: string) {
  switch (type) {
    case 'QUIZ':
      return {
        questions: [
          {
            id: "q1",
            question: `What is the main topic of "${title}"?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct: 0,
            explanation: "This is the correct answer based on the activity requirements."
          },
          {
            id: "q2", 
            question: "Which of the following is most important?",
            options: ["Quality", "Price", "Brand", "Features"],
            correct: 0,
            explanation: "Quality is typically the most important factor for customer satisfaction."
          },
          {
            id: "q3",
            question: "How would you rate your knowledge on this topic?",
            options: ["Beginner", "Intermediate", "Advanced", "Expert"],
            correct: 1,
            explanation: "Most users fall into the intermediate category after learning basics."
          }
        ],
        passingScore: 2,
        timeLimit: 300
      }

    case 'SURVEY':
      return {
        questions: [
          {
            id: "q1",
            question: `How satisfied are you with ${title}?`,
            type: "rating",
            scale: 5,
            required: true
          },
          {
            id: "q2",
            question: "What is your primary use case?",
            type: "multiple_choice",
            options: ["Personal use", "Business use", "Educational", "Other"],
            required: true
          },
          {
            id: "q3",
            question: "Any additional feedback?",
            type: "text",
            required: false
          }
        ]
      }

    case 'GAME':
      return {
        gameType: "trivia",
        rules: "Answer questions correctly to earn points. You have 30 seconds per question.",
        questions: [
          {
            id: "q1",
            question: "Quick trivia question about the topic",
            options: ["Answer A", "Answer B", "Answer C", "Answer D"],
            correct: 0,
            points: 10
          }
        ],
        timePerQuestion: 30,
        maxAttempts: 3
      }

    case 'DEMO':
      return {
        steps: [
          {
            id: "step1",
            title: "Introduction",
            content: `Welcome to the ${title} demonstration. Let's explore the key features.`,
            media: null,
            action: "Click to continue"
          },
          {
            id: "step2", 
            title: "Main Feature",
            content: "This is the main feature you'll be using most often.",
            media: null,
            action: "Try it out"
          },
          {
            id: "step3",
            title: "Completion",
            content: "Congratulations! You've completed the demo.",
            media: null,
            action: "Finish"
          }
        ],
        completionCriteria: "Complete all steps in the demonstration",
        estimatedDuration: 5
      }

    default:
      return { error: "Unknown activity type" }
  }
}