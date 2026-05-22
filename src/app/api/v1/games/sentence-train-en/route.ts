import { NextResponse } from "next/server"

// Sample English sentence puzzles for different grades
const puzzlesByGrade: Record<number, Array<{ original_sentence: string; scrambled_parts: string[] }>> = {
  1: [
    {
      original_sentence: "The cat is sleeping",
      scrambled_parts: ["sleeping", "cat", "is", "The"],
    },
    {
      original_sentence: "I love my family",
      scrambled_parts: ["family", "love", "my", "I"],
    },
    {
      original_sentence: "Birds can fly high",
      scrambled_parts: ["high", "can", "Birds", "fly"],
    },
  ],
  2: [
    {
      original_sentence: "The sun is very bright",
      scrambled_parts: ["bright", "is", "sun", "very", "The"],
    },
    {
      original_sentence: "We play in the park",
      scrambled_parts: ["park", "play", "the", "We", "in"],
    },
    {
      original_sentence: "She reads books every day",
      scrambled_parts: ["day", "reads", "every", "She", "books"],
    },
  ],
  3: [
    {
      original_sentence: "The children are playing happily",
      scrambled_parts: ["happily", "children", "playing", "The", "are"],
    },
    {
      original_sentence: "My mother cooks delicious food",
      scrambled_parts: ["food", "cooks", "My", "delicious", "mother"],
    },
    {
      original_sentence: "The dog runs very fast",
      scrambled_parts: ["fast", "runs", "dog", "very", "The"],
    },
  ],
  4: [
    {
      original_sentence: "Students learn many new things at school",
      scrambled_parts: ["school", "learn", "things", "Students", "new", "many", "at"],
    },
    {
      original_sentence: "The beautiful flowers bloom in spring",
      scrambled_parts: ["spring", "flowers", "bloom", "The", "beautiful", "in"],
    },
    {
      original_sentence: "We should always help each other",
      scrambled_parts: ["other", "always", "help", "We", "each", "should"],
    },
  ],
  5: [
    {
      original_sentence: "Reading books helps us learn new things",
      scrambled_parts: ["things", "books", "learn", "Reading", "new", "helps", "us"],
    },
    {
      original_sentence: "The teacher explained the lesson clearly",
      scrambled_parts: ["clearly", "teacher", "lesson", "The", "the", "explained"],
    },
    {
      original_sentence: "Exercise keeps our body healthy and strong",
      scrambled_parts: ["strong", "keeps", "body", "Exercise", "healthy", "our", "and"],
    },
  ],
  6: [
    {
      original_sentence: "Scientists discover new things through experiments",
      scrambled_parts: ["experiments", "discover", "things", "Scientists", "new", "through"],
    },
    {
      original_sentence: "Technology has changed our lives significantly",
      scrambled_parts: ["significantly", "has", "lives", "Technology", "our", "changed"],
    },
    {
      original_sentence: "We must protect the environment for future generations",
      scrambled_parts: ["generations", "protect", "environment", "We", "future", "the", "must", "for"],
    },
  ],
}

// Default puzzles (grade 1)
const defaultPuzzles = puzzlesByGrade[1]

export async function POST(request: Request) {
  try {
    // Parse request body for optional grade parameter
    let grade = 1
    try {
      const body = await request.json()
      if (body.grade && typeof body.grade === "number" && body.grade >= 1 && body.grade <= 6) {
        grade = body.grade
      }
    } catch {
      // Use default grade if body parsing fails
    }

    // Get puzzles for the specified grade
    const basePuzzles = puzzlesByGrade[grade] || defaultPuzzles

    // Create puzzles with stage numbers
    const puzzles = basePuzzles.map((puzzle, index) => ({
      stage: index,
      original_sentence: puzzle.original_sentence,
      scrambled_parts: shuffleArray([...puzzle.scrambled_parts]),
    }))

    return NextResponse.json({ puzzles })
  } catch (error) {
    console.error("[v0] Error generating English puzzles:", error)
    return NextResponse.json(
      { error: "Failed to generate puzzles" },
      { status: 500 }
    )
  }
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
