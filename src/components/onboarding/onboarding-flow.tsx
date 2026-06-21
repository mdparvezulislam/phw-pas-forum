"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code,
  Cpu,
  Hand,
  MapPin,
  MessageSquare,
  Palette,
  Search,
  Share2,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Upload,
  User,
  UserCircle,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  transitions,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ============================================
   TYPES & INTERFACES
   ============================================ */

interface OnboardingFlowProps {
  onComplete: () => void;
  username?: string;
}

interface Interest {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface SuggestedForum {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  members: number;
}

/* ============================================
   CONSTANTS
   ============================================ */

const PLATFORM_NAME = "BlackHatWorld";

const INTERESTS: Interest[] = [
  {
    id: "seo",
    label: "SEO",
    icon: <Search className="h-4 w-4" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "coding",
    label: "Coding",
    icon: <Code className="h-4 w-4" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: <Store className="h-4 w-4" />,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "ai",
    label: "AI",
    icon: <Cpu className="h-4 w-4" />,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "design",
    label: "Design",
    icon: <Palette className="h-4 w-4" />,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "social-media",
    label: "Social Media",
    icon: <Share2 className="h-4 w-4" />,
    color: "from-sky-500 to-blue-500",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    icon: <ShoppingCart className="h-4 w-4" />,
    color: "from-emerald-500 to-teal-500",
  },
];

const SUGGESTED_FORUMS: SuggestedForum[] = [
  {
    id: "seo-tools",
    name: "SEO Tools & Strategies",
    description: "Latest SEO techniques and tool discussions",
    icon: <Search className="h-5 w-5" />,
    members: 12500,
  },
  {
    id: "affiliate-marketing",
    name: "Affiliate Marketing",
    description: "Discuss affiliate programs and strategies",
    icon: <TrendingUp className="h-5 w-5" />,
    members: 8900,
  },
  {
    id: "coding-forum",
    name: "Web Development",
    description: "Programming and web dev discussions",
    icon: <Code className="h-5 w-5" />,
    members: 15200,
  },
  {
    id: "marketplace-deals",
    name: "Marketplace Deals",
    description: "Buy and sell digital services",
    icon: <Store className="h-5 w-5" />,
    members: 22000,
  },
  {
    id: "ai-tools",
    name: "AI & Automation",
    description: "Artificial intelligence and automation tools",
    icon: <Cpu className="h-5 w-5" />,
    members: 6800,
  },
  {
    id: "design-studio",
    name: "Design & Creative",
    description: "Graphic design and creative projects",
    icon: <Palette className="h-5 w-5" />,
    members: 4200,
  },
];

const STEPS = [
  { id: "welcome", title: "Welcome", icon: <Hand className="h-5 w-5" /> },
  { id: "interests", title: "Interests", icon: <Tag className="h-5 w-5" /> },
  {
    id: "forums",
    title: "Forums",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: "profile",
    title: "Profile",
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    id: "complete",
    title: "Complete",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

/* ============================================
   STEP COMPONENTS
   ============================================ */

function WelcomeStep({ username }: { username?: string }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        variants={staggerItem}
        className="mb-6 text-6xl"
        animate={{
          rotate: [0, 14, -8, 14, -4, 10, 0],
          transition: { duration: 1.5, ease: "easeInOut" },
        }}
      >
        👋
      </motion.div>
      <motion.h2
        variants={staggerItem}
        className="text-2xl font-bold text-foreground mb-3"
      >
        Welcome to {PLATFORM_NAME}
        {username ? `, ${username}` : ""}!
      </motion.h2>
      <motion.p
        variants={staggerItem}
        className="text-muted-foreground max-w-md leading-relaxed"
      >
        Join thousands of professionals sharing knowledge, trading services, and
        building successful online businesses. Let&apos;s get you started!
      </motion.p>
      <motion.div
        variants={staggerItem}
        className="mt-8 flex gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>50K+ Members</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>1M+ Posts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span>Active Community</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InterestsStep({
  selectedInterests,
  onToggle,
}: {
  selectedInterests: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-4"
    >
      <motion.div variants={staggerItem} className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What interests you?
        </h2>
        <p className="text-muted-foreground">
          Select at least 3 topics to personalize your experience
        </p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <motion.button
              key={interest.id}
              type="button"
              variants={staggerItem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(interest.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl p-4 border-2 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/50 hover:bg-accent",
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                >
                  <Check className="h-3 w-3" />
                </motion.div>
              )}
              <div
                className={cn(
                  "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white",
                  interest.color,
                )}
              >
                {interest.icon}
              </div>
              <span className="text-sm font-medium text-foreground">
                {interest.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <motion.div variants={staggerItem} className="mt-6 text-center">
        <Badge
          variant={selectedInterests.length >= 3 ? "success" : "secondary"}
        >
          {selectedInterests.length} of {INTERESTS.length} selected
        </Badge>
      </motion.div>
    </motion.div>
  );
}

function ForumsStep({
  selectedForums,
  onToggle,
  interests,
}: {
  selectedForums: string[];
  onToggle: (id: string) => void;
  interests: string[];
}) {
  const relevantForums = React.useMemo(() => {
    const interestForumMap: Record<string, string[]> = {
      seo: ["seo-tools"],
      marketing: ["affiliate-marketing"],
      coding: ["coding-forum"],
      marketplace: ["marketplace-deals"],
      ai: ["ai-tools"],
      design: ["design-studio"],
      "social-media": ["affiliate-marketing"],
      ecommerce: ["marketplace-deals"],
    };

    const forumIds = new Set<string>();
    for (const interest of interests) {
      const mapped = interestForumMap[interest] ?? [];
      for (const id of mapped) {
        forumIds.add(id);
      }
    }

    const relevant = SUGGESTED_FORUMS.filter((f) => forumIds.has(f.id));
    if (relevant.length >= 4) return relevant.slice(0, 6);
    return SUGGESTED_FORUMS.slice(0, 6);
  }, [interests]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-4"
    >
      <motion.div variants={staggerItem} className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Recommended Forums
        </h2>
        <p className="text-muted-foreground">
          Based on your interests, you might enjoy these communities
        </p>
      </motion.div>
      <div className="grid gap-3">
        {relevantForums.map((forum) => {
          const isFollowed = selectedForums.includes(forum.id);
          return (
            <motion.div
              key={forum.id}
              variants={staggerItem}
              className={cn(
                "flex items-center gap-4 rounded-xl p-4 border-2 transition-all duration-200",
                isFollowed
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30",
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {forum.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {forum.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {forum.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {(forum.members / 1000).toFixed(1)}K members
              </div>
              <Button
                variant={isFollowed ? "default" : "outline"}
                size="sm"
                onClick={() => onToggle(forum.id)}
                className="shrink-0"
              >
                {isFollowed ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Following
                  </>
                ) : (
                  "Follow"
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ProfileStep({
  bio,
  onBioChange,
  location,
  onLocationChange,
}: {
  bio: string;
  onBioChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-4"
    >
      <motion.div variants={staggerItem} className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Set up your profile
        </h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself (you can skip this for now)
        </p>
      </motion.div>
      <div className="max-w-md mx-auto space-y-6">
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
            className={cn(
              "relative h-28 w-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border bg-muted hover:border-primary/50 hover:bg-accent",
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Upload</span>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2">
            Drag & drop or click to upload
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-2">
          <label
            htmlFor="onboarding-bio"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            Bio
          </label>
          <textarea
            id="onboarding-bio"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Tell the community about yourself..."
            rows={3}
            maxLength={200}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {bio.length}/200
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-2">
          <label
            htmlFor="onboarding-location"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Location
          </label>
          <Input
            id="onboarding-location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. United States"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function CompleteStep({
  username,
  interests,
  forums,
}: {
  username?: string;
  interests: string[];
  forums: string[];
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        variants={staggerItem}
        className="mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.3,
          }}
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>
      </motion.div>
      <motion.h2
        variants={staggerItem}
        className="text-2xl font-bold text-foreground mb-3"
      >
        You&apos;re all set{username ? `, ${username}` : ""}!
      </motion.h2>
      <motion.p
        variants={staggerItem}
        className="text-muted-foreground max-w-md mb-8"
      >
        Your profile is ready. Start exploring communities, connecting with
        members, and sharing your knowledge.
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {interests.length}
          </div>
          <div className="text-xs text-muted-foreground">Interests</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{forums.length}</div>
          <div className="text-xs text-muted-foreground">Forums Following</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

export function OnboardingFlow({ onComplete, username }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>(
    [],
  );
  const [selectedForums, setSelectedForums] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [direction, setDirection] = React.useState(0);

  const totalSteps = STEPS.length;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleNext = React.useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, totalSteps, onComplete]);

  const handleBack = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = React.useCallback(() => {
    handleNext();
  }, [handleNext]);

  const toggleInterest = React.useCallback((id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const toggleForum = React.useCallback((id: string) => {
    setSelectedForums((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Backspace" && currentStep > 0) {
        handleBack();
      }
    },
    [handleNext, handleBack, currentStep],
  );

  const stepVariants = {
    enter: (stepDirection: number) => ({
      x: stepDirection > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (stepDirection: number) => ({
      x: stepDirection > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: direction resets on step change
  React.useEffect(() => {
    setDirection(1);
  }, [currentStep]);

  return (
    <div
      role="application"
      aria-label="Onboarding flow"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4"
      onKeyDown={handleKeyDown}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.spring}
        className="w-full max-w-2xl"
      >
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-6 pb-4">
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1.5">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          backgroundColor:
                            isCompleted || isActive
                              ? "hsl(var(--primary))"
                              : "hsl(var(--muted))",
                        }}
                        transition={transitions.spring}
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                          isCompleted || isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </motion.div>
                      <span
                        className={cn(
                          "text-xs font-medium hidden sm:block",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 sm:mx-3">
                        <div className="h-0.5 w-full rounded-full bg-muted">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: isCompleted ? "100%" : "0%",
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                {currentStep === 0 && <WelcomeStep username={username} />}
                {currentStep === 1 && (
                  <InterestsStep
                    selectedInterests={selectedInterests}
                    onToggle={toggleInterest}
                  />
                )}
                {currentStep === 2 && (
                  <ForumsStep
                    selectedForums={selectedForums}
                    onToggle={toggleForum}
                    interests={selectedInterests}
                  />
                )}
                {currentStep === 3 && (
                  <ProfileStep
                    bio={bio}
                    onBioChange={setBio}
                    location={location}
                    onLocationChange={setLocation}
                  />
                )}
                {currentStep === 4 && (
                  <CompleteStep
                    username={username}
                    interests={selectedInterests}
                    forums={selectedForums}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6 pt-2 flex items-center justify-between">
            <div>
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentStep < totalSteps - 1 && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              {currentStep === totalSteps - 1 ? (
                <Button
                  onClick={onComplete}
                  variant="gradient"
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Start Exploring
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  iconRight={<ArrowRight className="h-4 w-4" />}
                  disabled={currentStep === 1 && selectedInterests.length < 3}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>

        {currentStep < totalSteps - 1 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-4 text-center"
          >
            <button
              type="button"
              onClick={onComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Skip onboarding entirely
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
