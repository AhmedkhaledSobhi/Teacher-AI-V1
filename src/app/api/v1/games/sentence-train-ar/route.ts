import { NextResponse } from "next/server"

// Sample Arabic sentence puzzles for different grades
const puzzlesByGrade: Record<number, Array<{ original_sentence: string; scrambled_parts: string[] }>> = {
  1: [
    {
      original_sentence: "إن تدرس تنجح",
      scrambled_parts: ["تنجح", "تدرس", "إن"],
    },
    {
      original_sentence: "الشمس مشرقة اليوم",
      scrambled_parts: ["اليوم", "الشمس", "مشرقة"],
    },
    {
      original_sentence: "أنا أحب المدرسة",
      scrambled_parts: ["المدرسة", "أنا", "أحب"],
    },
  ],
  2: [
    {
      original_sentence: "القطة تلعب في الحديقة",
      scrambled_parts: ["الحديقة", "تلعب", "في", "القطة"],
    },
    {
      original_sentence: "أمي تطبخ طعاماً لذيذاً",
      scrambled_parts: ["لذيذاً", "تطبخ", "أمي", "طعاماً"],
    },
    {
      original_sentence: "الطيور تغرد في الصباح",
      scrambled_parts: ["الصباح", "تغرد", "في", "الطيور"],
    },
  ],
  3: [
    {
      original_sentence: "العلم نور والجهل ظلام",
      scrambled_parts: ["ظلام", "نور", "والجهل", "العلم"],
    },
    {
      original_sentence: "نحن نحب وطننا كثيراً",
      scrambled_parts: ["كثيراً", "نحب", "نحن", "وطننا"],
    },
    {
      original_sentence: "الصدق أساس كل فضيلة",
      scrambled_parts: ["فضيلة", "أساس", "كل", "الصدق"],
    },
  ],
  4: [
    {
      original_sentence: "القراءة تفتح آفاق المعرفة الواسعة",
      scrambled_parts: ["الواسعة", "تفتح", "المعرفة", "القراءة", "آفاق"],
    },
    {
      original_sentence: "المعلم يغرس بذور العلم في عقولنا",
      scrambled_parts: ["عقولنا", "يغرس", "العلم", "المعلم", "بذور", "في"],
    },
    {
      original_sentence: "الرياضة تقوي الجسم والعقل معاً",
      scrambled_parts: ["معاً", "تقوي", "والعقل", "الرياضة", "الجسم"],
    },
  ],
  5: [
    {
      original_sentence: "التعاون سر النجاح في الحياة",
      scrambled_parts: ["الحياة", "سر", "في", "التعاون", "النجاح"],
    },
    {
      original_sentence: "الأخلاق الحسنة تزين صاحبها بالجمال",
      scrambled_parts: ["بالجمال", "الحسنة", "صاحبها", "الأخلاق", "تزين"],
    },
    {
      original_sentence: "من جد وجد ومن زرع حصد",
      scrambled_parts: ["حصد", "وجد", "زرع", "جد", "من", "ومن"],
    },
  ],
  6: [
    {
      original_sentence: "العقل السليم في الجسم السليم",
      scrambled_parts: ["السليم", "في", "الجسم", "العقل", "السليم"],
    },
    {
      original_sentence: "الصبر مفتاح الفرج في الشدائد",
      scrambled_parts: ["الشدائد", "مفتاح", "في", "الصبر", "الفرج"],
    },
    {
      original_sentence: "طلب العلم فريضة على كل مسلم",
      scrambled_parts: ["مسلم", "العلم", "على", "طلب", "فريضة", "كل"],
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
    console.error("[v0] Error generating Arabic puzzles:", error)
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
