// Type Imports
import type { ChatDataType } from "@/types/apps/chatTypes";

const previousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
const dayBeforePreviousDay = new Date(
  new Date().getTime() - 24 * 60 * 60 * 1000 * 2
);

export const db: ChatDataType = {
  profileUser: {
    id: 1,
    avatar: "/images/avatars/1.png",
    fullName: "John Doe",
    role: "Admin",
    about:
      "Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie brownie marshmallow.",
    status: "online",
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false,
    },
  },
  isLoadingThreadMessages: false,
  threadMessagesError: null,
  contacts: [
    {
      id: 100,
      fullName: "Teacher AI",
      role: "AI Learning Assistant",
      about:
        "I am your friendly AI learning assistant! I can help you learn new things, answer your questions, and make learning fun!",
      avatarColor: "primary",
      status: "online",
      isAI: true,
      aiModel: "teacher",
    },
    {
      id: 101,
      fullName: "ChatGPT",
      role: "AI Assistant",
      about:
        "I am ChatGPT, an AI language model designed to be helpful, harmless, and honest in my interactions.",
      avatarColor: "success",
      status: "online",
      isAI: true,
      aiModel: "chatgpt",
    },
    {
      id: 102,
      fullName: "Gemini",
      role: "AI Assistant",
      about:
        "I am Gemini, a multimodal AI assistant that can understand and process text, images, and more to help you with various tasks.",
      avatarColor: "info",
      status: "online",
      isAI: true,
      aiModel: "gemini",
    },
    {
      id: 2,
      fullName: "Felecia Rower",
      role: "Frontend Developer",
      about:
        "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
      avatar: "/images/avatars/2.png",
      status: "offline",
    },
    {
      id: 3,
      fullName: "Adalberto Granzin",
      role: "UI/UX Designer",
      avatarColor: "primary",
      about:
        "Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.",
      status: "busy",
    },
    {
      id: 4,
      fullName: "Joaquina Weisenborn",
      role: "Town planner",
      about:
        "Soufflé soufflé caramels sweet roll. Jelly lollipop sesame snaps bear claw jelly beans sugar plum sugar plum.",
      avatar: "/images/avatars/8.png",
      status: "busy",
    },
    {
      id: 5,
      fullName: "Margot Henschke",
      role: "Dietitian",
      avatarColor: "success",
      about:
        "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
      status: "busy",
    },
    {
      id: 6,
      avatarColor: "warning",
      fullName: "Bridgett Omohundro",
      role: "Designer, television/film set",
      about:
        "Gummies gummi bears I love candy icing apple pie I love marzipan bear claw. I love tart biscuit I love candy canes pudding chupa chups liquorice croissant.",
      status: "offline",
    },
    {
      id: 7,
      fullName: "Sal Piggee",
      role: "Marketing executive",
      about:
        "Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.",
      avatarColor: "info",
      status: "online",
    },
    {
      id: 8,
      fullName: "Miguel Guelff",
      role: "Special educational needs teacher",
      about:
        "Biscuit powder oat cake donut brownie ice cream I love soufflé. I love tootsie roll I love powder tootsie roll.",
      avatar: "/images/avatars/7.png",
      status: "online",
    },
    {
      id: 9,
      fullName: "Mauro Elenbaas",
      role: "Advertising copywriter",
      about:
        "Bear claw ice cream lollipop gingerbread carrot cake. Brownie gummi bears chocolate muffin croissant jelly I love marzipan wafer.",
      avatarColor: "success",
      status: "away",
    },
    {
      id: 10,
      avatarColor: "error",
      fullName: "Zenia Jacobs",
      role: "Building surveyor",
      about:
        "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
      status: "away",
    },
    {
      id: 11,
      fullName: "Ramonita Veras",
      role: "CEO",
      about:
        "Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.",
      avatar: "/images/avatars/4.png",
      status: "online",
    },
    {
      id: 12,
      fullName: "Lashawna Gotschall",
      role: "Therapist, sports",
      about:
        "Soufflé soufflé caramels sweet roll. Jelly lollipop sesame snaps bear claw jelly beans sugar plum sugar plum.",
      avatarColor: "info",
      status: "online",
    },
    {
      id: 13,
      fullName: "Rosalva Uyetake",
      role: "Engineer, civil (consulting)",
      about:
        "Chupa chups candy canes chocolate bar marshmallow liquorice muffin. Lemon drops oat cake tart liquorice tart cookie. Jelly-o cookie tootsie roll halvah.",
      avatar: "/images/avatars/6.png",
      status: "offline",
    },
    {
      id: 14,
      fullName: "Cecilia Shockey",
      role: "Database administrator",
      about:
        "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
      avatarColor: "secondary",
      status: "busy",
    },
    {
      id: 15,
      fullName: "Harriett Duropan",
      role: "Therapist, sports",
      about:
        "Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.",
      avatar: "/images/avatars/5.png",
      status: "online",
    },
    {
      id: 16,
      fullName: "Lauran Starner",
      role: "AI specialist",
      about:
        "Soufflé soufflé caramels sweet roll. Jelly lollipop sesame snaps bear claw jelly beans sugar plum sugar plum.",
      avatarColor: "warning",
      status: "online",
    },
    {
      id: 17,
      fullName: "Verla Morgano",
      role: "Data scientist",
      about:
        "Chupa chups candy canes chocolate bar marshmallow liquorice muffin. Lemon drops oat cake tart liquorice tart cookie. Jelly-o cookie tootsie roll halvah.",
      avatar: "/images/avatars/3.png",
      status: "online",
    },
  ],
  chats: [
    {
      id: 100,
      userId: 100,
      title: "Learning about dinosaurs",
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message: "Hi Teacher AI! Can you tell me about dinosaurs?",
          time: previousDay,
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Hello there! 🦖 I'd be happy to tell you about dinosaurs! Dinosaurs were amazing creatures that lived millions of years ago. They came in all shapes and sizes - some were as small as chickens, while others were as big as buildings! The word 'dinosaur' means 'terrible lizard'. What would you like to know about them specifically?",
          time: previousDay,
          senderId: 100,
          isAIResponse: true,
        },
        {
          message: "What's the biggest dinosaur that ever lived?",
          time: previousDay,
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Great question! 🦕 The biggest dinosaur we know about is called Argentinosaurus. It was a type of sauropod (long-neck dinosaur) that could grow up to 100-130 feet long and might have weighed as much as 100 tons! That's as heavy as about 15 elephants! Scientists found its fossils in Argentina, which is how it got its name. Would you like to know about other big dinosaurs too?",
          time: previousDay,
          senderId: 100,
          isAIResponse: true,
        },
      ],
    },
    {
      id: 101,
      userId: 101,
      title: "Help with homework",
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message: "Hi ChatGPT! I need help with my math homework.",
          time: dayBeforePreviousDay,
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Hello! I'd be happy to help with your math homework. What kind of math problems are you working on?",
          time: dayBeforePreviousDay,
          senderId: 101,
          isAIResponse: true,
        },
        {
          message: "I'm trying to solve fractions. How do I add 1/4 + 2/3?",
          time: dayBeforePreviousDay,
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Great question! To add fractions with different denominators, we need to find a common denominator first.\n\n1. The denominators are 4 and 3\n2. The least common multiple (LCM) of 4 and 3 is 12\n3. Convert each fraction to an equivalent fraction with denominator 12:\n   - 1/4 = 3/12 (multiply top and bottom by 3)\n   - 2/3 = 8/12 (multiply top and bottom by 4)\n4. Now add: 3/12 + 8/12 = 11/12\n\nSo, 1/4 + 2/3 = 11/12\n\nWould you like me to explain any part of this in more detail?",
          time: dayBeforePreviousDay,
          senderId: 101,
          isAIResponse: true,
        },
      ],
    },
    {
      id: 102,
      userId: 102,
      title: "Learning about space",
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message:
            "Hi Gemini! Can you tell me about the planets in our solar system?",
          time: new Date(),
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Hello! I'd love to tell you about the planets in our solar system! 🪐\n\nOur solar system has 8 planets that orbit around the Sun:\n\n1. Mercury - The smallest and closest to the Sun. It's rocky and has no atmosphere.\n\n2. Venus - Similar in size to Earth but covered in thick toxic clouds that trap heat, making it the hottest planet.\n\n3. Earth - Our home! The only known planet with liquid water and life.\n\n4. Mars - The \"Red Planet\" with rusty soil, polar ice caps, and the largest volcano in the solar system.\n\n5. Jupiter - The largest planet, a gas giant with a famous Great Red Spot storm.\n\n6. Saturn - Famous for its beautiful rings made of ice and rock particles.\n\n7. Uranus - An ice giant that rotates on its side like a rolling ball.\n\n8. Neptune - The windiest planet with storms that can reach speeds of over 1,200 mph!\n\nWhat planet would you like to learn more about?",
          time: new Date(),
          senderId: 102,
          isAIResponse: true,
        },
      ],
    },

    {
      id: 2,
      userId: 3,
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message: "Hi",
          time: "Mon Dec 10 2018 07:45:00 GMT+0000 (GMT)",
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: "Hello. How can I help You?",
          time: "Mon Dec 11 2018 07:45:15 GMT+0000 (GMT)",
          senderId: 3,
        },
        {
          message:
            "Can I get details of my last transaction I made last month? 🤔",
          time: "Mon Dec 11 2018 07:46:10 GMT+0000 (GMT)",
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: "We need to check if we can provide you such information.",
          time: "Mon Dec 11 2018 07:45:15 GMT+0000 (GMT)",
          senderId: 3,
        },
        {
          message: "I will inform you as I get update on this.",
          time: "Mon Dec 11 2018 07:46:15 GMT+0000 (GMT)",
          senderId: 3,
        },
        {
          message: "If it takes long you can mail me at my mail address.",
          time: dayBeforePreviousDay,
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false,
          },
        },
      ],
    },
    {
      id: 3,
      userId: 10,
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message:
            "Hello, I am a building surveyor and I would like to schedule a survey for your building.",
          time: "Mon Dec 13 2021 11:00:00 GMT+0000 (GMT)",
          senderId: 10,
        },
        {
          message:
            "Sure, could you please provide more details about the survey?",
          time: "Mon Dec 13 2021 11:01:00 GMT+0000 (GMT)",
          senderId: 1,
        },
        {
          message:
            "The survey will include a thorough inspection of the building to assess its condition and identify any potential issues.",
          time: "Mon Dec 13 2021 11:02:00 GMT+0000 (GMT)",
          senderId: 10,
        },
        {
          message: "Okay, when do you plan to conduct the survey?",
          time: "Mon Dec 13 2021 11:03:00 GMT+0000 (GMT)",
          senderId: 1,
        },
        {
          message:
            "I am available to conduct the survey next week. Does that work for you?",
          time: "Mon Dec 13 2021 11:04:00 GMT+0000 (GMT)",
          senderId: 10,
        },
        {
          message:
            "Yes, that works for me. Let's schedule it for next Wednesday.",
          time: "Mon Dec 13 2021 11:05:00 GMT+0000 (GMT)",
          senderId: 1,
        },
        {
          message:
            "Great. I will send you a confirmation email with the details.",
          time: "Mon Dec 13 2021 11:06:00 GMT+0000 (GMT)",
          senderId: 10,
        },
        {
          message: "Thank you, looking forward to it.",
          time: "Mon Dec 13 2021 11:07:00 GMT+0000 (GMT)",
          senderId: 1,
        },
      ],
    },
    {
      id: 4,
      userId: 8,
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message: "Hello, I would like to arrange a professional meeting.",
          time: "Mon Dec 10 2018 07:45:00 GMT+0000 (GMT)",
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Sure, could you please provide more details about the meeting?",
          time: "Mon Dec 11 2018 07:45:15 GMT+0000 (GMT)",
          senderId: 8,
        },
        {
          message: "The meeting is about our next project plan.",
          time: "Mon Dec 11 2018 07:46:10 GMT+0000 (GMT)",
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message:
            "Okay, I will prepare the necessary documents for the meeting.",
          time: "Mon Dec 11 2018 07:45:15 GMT+0000 (GMT)",
          senderId: 8,
        },
        {
          message: "Thank you, looking forward to it.",
          time: "Mon Dec 11 2018 07:46:15 GMT+0000 (GMT)",
          senderId: 1,
        },
      ],
    },
    {
      id: 5,
      userId: 16,
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message: "Hey, have you heard about the new AI model GPT-4?",
          time: "Mon Dec 13 2021 09:00:00 GMT+0000 (GMT)",
          senderId: 16,
        },
        {
          message: "No, I haven't. What's new about it?",
          time: "Mon Dec 13 2021 09:01:00 GMT+0000 (GMT)",
          senderId: 1,
        },
        {
          message:
            "It's supposed to be even more powerful and accurate than GPT-3. It can generate even more realistic text.",
          time: "Mon Dec 13 2021 09:02:00 GMT+0000 (GMT)",
          senderId: 16,
        },
        {
          message: "That sounds interesting. I'll have to check it out.",
          time: "Mon Dec 13 2021 09:03:00 GMT+0000 (GMT)",
          senderId: 1,
        },
      ],
    },

    {
      id: 7,
      userId: 17,
      unseenMsgs: 0,
      oldChat: [],
      chat: [
        {
          message:
            "Hello, as a data scientist, I have been analyzing our user data and found some interesting patterns.",
          time: "Mon Dec 13 2021 12:00:00 GMT+0000 (GMT)",
          senderId: 17,
        },
        {
          message:
            "That sounds interesting. Could you please share more details?",
          time: "Mon Dec 13 2021 12:01:00 GMT+0000 (GMT)",
          senderId: 1,
        },
        {
          message:
            "Sure, our users are most active during the evening hours and they mostly use our app on weekends.",
          time: "Mon Dec 13 2021 12:02:00 GMT+0000 (GMT)",
          senderId: 17,
        },
        {
          message:
            "That's valuable information. We can use this to schedule our app updates and maintenance work.",
          time: "Mon Dec 13 2021 12:03:00 GMT+0000 (GMT)",
          senderId: 1,
        },
        {
          message:
            "Exactly. We can also use this information to target our marketing campaigns.",
          time: "Mon Dec 13 2021 12:04:00 GMT+0000 (GMT)",
          senderId: 17,
        },
        {
          message: "Great work. Keep it up.",
          time: "Mon Dec 13 2021 12:05:00 GMT+0000 (GMT)",
          senderId: 1,
        },
      ],
    },
  ],
  messages: [],
  messagesLoading: false,
};
