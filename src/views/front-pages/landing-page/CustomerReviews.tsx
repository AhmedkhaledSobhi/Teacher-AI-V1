// MUI Imports
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";

// Third-party Imports
import { useKeenSlider } from "keen-slider/react";
import classnames from "classnames";

// Component Imports
import CustomIconButton from "@core/components/mui/IconButton";
import CustomAvatar from "@core/components/mui/Avatar";

// Styled Component Imports
import AppKeenSlider from "@/libs/styles/AppKeenSlider";

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css";
import styles from "./styles.module.css";

// Data type
type ReviewData = {
  desc: string;
  rating: number;
  name: string;
  position: string;
  avatarSrc?: string;
};

// Data
const data: ReviewData[] = [
  {
    desc: "المنصة غيرت طريقة تعلم ابني تمامًا! أصبح يستمتع بالدروس ويتفاعل مع المعلم الذكي كأنه يتحدث إلى مدرس حقيقي.",
    rating: 5,
    name: "أم محمد",
    position: "ولية أمر طالب بالصف الرابع",
    // avatarSrc: "/images/avatars/1.png",
  },
  {
    desc: "أكثر ما أعجبني هو أن المنصة تتيح لي مراجعة دروسي بالصوت والصورة وأستطيع رفع صور من الكتاب والحصول على إجابات دقيقة.",
    rating: 5,
    name: "أحمد خالد",
    position: "طالب بالصف السادس",
    // avatarSrc: "/images/avatars/2.png",
  },
  {
    desc: "التجربة ممتازة، خصوصًا في متابعة أبنائي. أستطيع أن أطمئن أنهم يتعلمون بشكل آمن وفعال داخل بيئة ذكية ومناسبة.",
    rating: 4,
    name: "سارة علي",
    position: "ولية أمر",
    // avatarSrc: "/images/avatars/3.png",
  },
  {
    desc: "كمعلم، أرى أن المنصة تقدم محتوى تفاعلي يساعد الطلاب على فهم المناهج بشكل أعمق ويزيد من حماسهم للتعلم.",
    rating: 5,
    name: "الأستاذ محمود",
    position: "معلم رياضيات",
    // avatarSrc: "/images/avatars/4.png",
  },
  {
    desc: "ابني كان يعاني من صعوبة في مادة العلوم، والآن أصبح يطرح الأسئلة على المعلم الذكي ويحصول على إجابات فورية ومبسطة.",
    rating: 5,
    name: "منى حسن",
    position: "ولية أمر",
    // avatarSrc: "/images/avatars/5.png",
  },
  {
    desc: "منصة مميزة وسهلة الاستخدام، تساعد الطلاب على الاستعداد للاختبارات بشكل أفضل من خلال التمارين والأسئلة التفاعلية.",
    rating: 5,
    name: "يوسف إبراهيم",
    position: "طالب",
    // avatarSrc: "/images/avatars/6.png",
  },
];

const CustomerReviews = () => {
  // Hooks
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: {
        perView: 3,
        origin: "auto",
      },
      breakpoints: {
        "(max-width: 1200px)": {
          slides: {
            perView: 2,
            spacing: 10,
            origin: "auto",
          },
        },
        "(max-width: 900px)": {
          slides: {
            perView: 2,
            spacing: 10,
          },
        },
        "(max-width: 600px)": {
          slides: {
            perView: 1,
            spacing: 10,
            origin: "center",
          },
        },
      },
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        const mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 2000);
        }

        slider.on("created", nextTimeout);
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <section
      className={classnames(
        "flex flex-col gap-8 plb-[100px]",
        styles.sectionStartRadius
      )}
      style={{ background: "var(--lp-bg)" }}
      dir="rtl"
    >
      <div
        className={classnames(
          "flex max-md:flex-col max-sm:flex-wrap is-full gap-6",
          frontCommonStyles.layoutSpacing
        )}
      >
        {/* العنوان والوصف */}
        <div className="flex flex-col gap-1 bs-full justify-center items-center lg:items-start is-full md:is-[30%] mlb-auto sm:pbs-2">
          <Chip
            label="آراء المستخدمين"
            variant="tonal"
            color="primary"
            size="small"
            className="mbe-3"
          />
          <div className="flex flex-col gap-y-1 flex-wrap max-lg:text-center ">
            <Typography color="text.primary" variant="h4">
              <span className="relative z-[1] font-extrabold">
                ماذا يقول الطلاب وأولياء الأمور؟
                <img
                  src="/images/front-pages/landing-page/bg-shape.png"
                  alt="bg-shape"
                  className="absolute block-end-0 z-[1] bs-[40%] is-[132%] inline-start-[-8%] block-start-[17px]"
                />
              </span>
            </Typography>
            <Typography>
              تجارب حقيقية من مستخدمين استفادوا من منصتنا التعليمية الذكية.
            </Typography>
          </div>
          <div className="flex gap-x-4 mbs-11">
            <CustomIconButton
              color="primary"
              variant="tonal"
              onClick={() => instanceRef.current?.next()}
            >
              <i className="tabler-chevron-right" />
            </CustomIconButton>
            <CustomIconButton
              color="primary"
              variant="tonal"
              onClick={() => instanceRef.current?.prev()}
            >
              <i className="tabler-chevron-left" />
            </CustomIconButton>
          </div>
        </div>

        {/* الريفيوز */}
        <div className="is-full md:is-[70%]">
          <AppKeenSlider>
            <div ref={sliderRef} className="keen-slider mbe-6">
              {data.map((item, index) => (
                <div key={index} className="keen-slider__slide flex p-4 sm:p-3">
                  <Card elevation={8} className="flex items-start">
                    <CardContent className="p-8 items-center mlb-auto">
                      <div className="flex flex-col gap-4 items-start">
                        <Typography>{item.desc}</Typography>
                        <Rating value={item.rating} readOnly />
                        <div className="flex items-center gap-x-3">
                          <CustomAvatar
                            size={32}
                            {...(item.avatarSrc && { src: item.avatarSrc })}
                            alt={item.name}
                          >
                            {!item.avatarSrc && item.name.charAt(0)}
                          </CustomAvatar>
                          <div className="flex flex-col items-start">
                            <Typography
                              color="text.primary"
                              className="font-medium"
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                              {item.position}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </AppKeenSlider>
        </div>
      </div>

      {/* الشعارات */}
      <Divider />
      {/* <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mli-3">
        <img
          src="/images/partners/moe-sa.png"
          alt="وزارة التعليم"
          className="h-10"
        />
        <img
          src="/images/partners/madrasti.png"
          alt="منصة مدرستي"
          className="h-10"
        />
        <img
          src="/images/partners/king-salman.png"
          alt="مكتبة الملك سلمان"
          className="h-10"
        />
        <img
          src="/images/partners/taalem.png"
          alt="تعليم تفاعلي"
          className="h-10"
        />
      </div> */}
    </section>
  );
};

export default CustomerReviews;
