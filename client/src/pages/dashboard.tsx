import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Users, GripVertical, X, Plus, ChevronDown, ChevronRight, 
  Copy, Check, ShieldAlert, Trophy, AlertTriangle, History, 
  UserPlus, ArrowRight, Zap, Sparkles, Layout, MessageSquare,
  Shield, Activity, ClipboardCheck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- Types & Constants ---
type Rank = string;
interface Reviewer { id: string; username: string; rank: Rank; }
interface HistoryEntry { type: string; count: number; timeAgo: string; }

interface FormData {
  reviewers: Reviewer[];
  promotee: { username: string; oldRank: string; newRank: string; reason: string; };
  factors: { 
    departments: string; 
    leaveOfAbsence: string; 
    infractionHistory: string; 
    reformationStatus: string; 
  };
  sessionActivity: { 
    hosts: number;
    coHosts: number;
    supervisions: number;
    helpers: number;
    hardestWorkers: number;
    patrolLogs: number;
    inspectionsHosted: number;
    inspectionsCoHosted: number;
    inspectionsHelped: number;
  };
  inGameActivity: { 
    minutesThisMonth: number; 
    minutesLastMonth: number; 
    level: number; 
  };
  maturity: { 
    averageGrade: number; 
    professionalism: number; 
    presence: number; 
  };
  chats: { 
    grammar: number; 
    messages: number;
    intelLogs: number;
  };
  departments: string[];
  history: HistoryEntry[];
  approvedBy: string;
}

const PRELOADED_USERS: Reviewer[] = [
  { id: "1", username: "opgamercd", rank: "BDT" },
  { id: "2", username: "xDylx_n", rank: "BoG" },
  { id: "3", username: "ishhjgd", rank: "CAC" },
  { id: "4", username: "xEli_te2006", rank: "BDT" },
  { id: "5", username: "jaysonplaysvieo", rank: "BoG" },
  { id: "6", username: "jojoinzoravar", rank: "CoS" },
  { id: "7", username: "martboy45", rank: "CoS" },
  { id: "8", username: "Seraphable_sama", rank: "PC" },
  { id: "9", username: "xMist_y", rank: "BDT" },
  { id: "10", username: "XxDarkPrinceXxxx", rank: "BoG" },
];

const DEPARTMENTS_LIST = [
  "Intelligence Agency", "Game Administration", "Support Agency", 
  "Community Management", "Overseer Command", "Discord Moderation", 
  "Events Team", "Certified High Rank", "Increased Chance of Promotion", "EoTW"
];

const HISTORY_TYPES = [
  "VW", "SW", "Kick", "Mute", "Tool-Ban", "Server-Ban", "Team-Ban", 
  "5m Game-Ban", "Game-Ban", "Rank-Lock", "Demotion", "Suspension", 
  "Termination", "Blacklist"
];

const TIME_AGO_OPTIONS = ["1 Week", "1 Month", "2 Months", "3 Months", "6+ Months"];

// --- Sub-components ---

const SectionCard = ({ title, icon: Icon, children, isOpen, isComplete, onToggle, index }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative rounded-2xl transition-all duration-500",
        isOpen ? "glass-panel p-6 ring-1 ring-primary/30" : "bg-white/2 hover:bg-white/5 p-4 border border-white/5 cursor-pointer",
        !isOpen && isComplete && "border-emerald-500/30 bg-emerald-500/5"
      )}
      onClick={() => !isOpen && onToggle()}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
            isOpen ? "bg-primary text-black scale-110 rotate-3" : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
          )}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className={cn(
              "font-display font-bold tracking-tight text-lg transition-colors",
              isOpen ? "text-white" : "text-muted-foreground group-hover:text-white"
            )}>
              {title}
            </h3>
            {!isOpen && isComplete && (
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">Verified Section</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isComplete && !isOpen && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-500", isOpen && "rotate-90 text-primary")} />
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Dashboard() {
  const [openSection, setOpenSection] = useState<string>("reviewers");
  const [selectedReviewers, setSelectedReviewers] = useState<Reviewer[]>([]);
  const [generatedLog, setGeneratedLog] = useState("");

  const form = useForm<FormData>({
    defaultValues: {
      promotee: { username: "", oldRank: "", newRank: "", reason: "Activity Recognized!" },
      factors: { departments: "", leaveOfAbsence: "", infractionHistory: "", reformationStatus: "" },
      sessionActivity: { 
        hosts: 0, coHosts: 0, supervisions: 0, helpers: 0, 
        hardestWorkers: 0, patrolLogs: 0, inspectionsHosted: 0, 
        inspectionsCoHosted: 0, inspectionsHelped: 0 
      },
      inGameActivity: { minutesThisMonth: 0, minutesLastMonth: 0, level: 0 },
      maturity: { averageGrade: 10, professionalism: 100, presence: 100 },
      chats: { grammar: 100, messages: 0, intelLogs: 0 },
      departments: [],
      history: [],
      approvedBy: "",
    }
  });

  const { register, watch, setValue } = form;
  const formData = watch();

  const isReviewersComplete = selectedReviewers.length > 0;
  const isPromoteeComplete = formData.promotee.username && formData.promotee.oldRank && formData.promotee.newRank;
  const isActivityComplete = formData.inGameActivity.minutesThisMonth > 0 || formData.sessionActivity.patrolLogs > 0;

  const toggleReviewer = (user: Reviewer) => {
    setSelectedReviewers(prev => 
      prev.find(r => r.id === user.id) ? prev.filter(r => r.id !== user.id) : [...prev, user]
    );
  };

  const generate = () => {
    const d = formData;
    const rNames = selectedReviewers.map(r => r.username).join(", ");
    const rRanks = selectedReviewers.map(r => r.rank).join(", ");
    
    let log = `Your Username: ${rNames}\n`;
    log += `Your Rank: ${rRanks}\n`;
    log += `Their Username: ${d.promotee.username}\n`;
    log += `Old Rank - New Rank: ${d.promotee.oldRank} - ${d.promotee.newRank}\n`;
    log += `Reason: ${d.promotee.reason}\n`;
    
    const factorsText = d.factors.departments;
    
    log += `Factors of Determination: ${factorsText || "[Explain Reason For Promotion]"}\n`;
    log += `--------------\n`;
    
    log += `**Session Activity:**\n`;
    log += `${d.sessionActivity.hosts} Hosts\n`;
    log += `${d.sessionActivity.coHosts} Co-Hosts\n`;
    log += `${d.sessionActivity.supervisions} Supervisions\n`;
    log += `${d.sessionActivity.helpers} Helpers\n`;
    log += `${d.sessionActivity.hardestWorkers} Hardest Workers\n`;
    log += `${d.sessionActivity.patrolLogs} Patrol Logs\n`;
    log += `${d.sessionActivity.inspectionsHosted} Inspections Hosted\n`;
    log += `${d.sessionActivity.inspectionsCoHosted} Inspections Co-Hosted\n`;
    log += `${d.sessionActivity.inspectionsHelped} Inspections Helped\n`;
    log += `--------------\n`;

    log += `**In-Game Activity:**\n`;
    log += `${d.inGameActivity.minutesThisMonth}+ Minutes This Month\n`;
    log += `${d.inGameActivity.minutesLastMonth}+ Minutes Last Month\n`;
    log += `Level ${d.inGameActivity.level}+\n`;
    log += `--------------\n`;

    log += `**Maturity and Professionalism:**\n`;
    log += `${d.maturity.averageGrade} Average Grade\n`;
    log += `${d.maturity.professionalism}% Average Professionalism\n`;
    log += `${d.maturity.presence}% Average Presence\n`;
    log += `--------------\n`;

    log += `**Chats:**\n`;
    log += `${d.chats.grammar}% Grammar on Staff Teams\n`;
    log += `${d.chats.messages} Messages\n`;
    log += `--------------\n`;

    log += `**Departments & Extra:**\n`;
    d.departments.forEach(dept => log += `${dept}\n`);
    log += `--------------\n`;

    log += `**History:**\n`;
    if (d.history.length > 0) {
      d.history.forEach(h => log += `${h.count} ${h.type} [${h.timeAgo} Ago]\n`);
    } else {
      log += `Clean Record\n`;
    }
    
    log += `\nApproved By: ${d.approvedBy}`;
    
    setGeneratedLog(log);
    setOpenSection("output");
  };

  return (
    <div className="relative min-h-screen py-12 px-4 overflow-hidden">
      <div className="floating-glow top-0 -left-20 animate-float" />
      <div className="floating-glow bottom-0 -right-20 animate-float" style={{ animationDelay: '-5s', background: 'radial-gradient(circle, hsl(260 95% 50% / 0.1) 0%, transparent 70%)' }} />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col items-center text-center space-y-4 mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(0,255,255,0.2)]">
            <ShieldAlert size={32} />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-5xl font-display font-black tracking-tighter text-white">
              POS <span className="text-primary italic">PROMPT</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.4em]">Internal Promotion Interface</p>
          </div>
        </header>

        {/* 1. Promotion Team */}
        <SectionCard title="Promotion Team" icon={Users} index={0} isOpen={openSection === "reviewers"} isComplete={isReviewersComplete} onToggle={() => setOpenSection("reviewers")}>
          <Reorder.Group 
            axis="y" 
            values={selectedReviewers} 
            onReorder={setSelectedReviewers}
            className="space-y-2"
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              {PRELOADED_USERS.map(user => {
                const isSelected = selectedReviewers.find(r => r.id === user.id);
                return (
                  <motion.button
                    key={user.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleReviewer(user)}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border transition-all text-left",
                      isSelected ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 text-white"
                    )}
                  >
                    <span className="text-xs font-bold truncate">{user.username}</span>
                    <span className="text-[10px] opacity-70">{user.rank}</span>
                  </motion.button>
                );
              })}
            </div>

            {selectedReviewers.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2">Drag to Reorder Team</label>
                {selectedReviewers.map((user) => (
                  <Reorder.Item
                    key={user.id}
                    value={user}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical size={16} className="text-white/30" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{user.username}</span>
                      <span className="text-[10px] text-white/50">{user.rank}</span>
                    </div>
                  </Reorder.Item>
                ))}
              </div>
            )}
          </Reorder.Group>
        </SectionCard>

        {/* 2. Promotee Details */}
        <SectionCard title="Promotee Details" icon={UserPlus} index={1} isOpen={openSection === "promotee"} isComplete={isPromoteeComplete} onToggle={() => setOpenSection("promotee")}>
           <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-primary tracking-widest">Username</label>
                <Input {...register("promotee.username")} placeholder="Roblox Name..." className="bg-black/40 border-white/10 h-11 rounded-xl" />
              </div>
              <div className="flex items-end gap-2">
                <Input {...register("promotee.oldRank")} placeholder="Old Rank" className="text-center bg-black/40 border-white/10 h-11 rounded-xl" />
                <ArrowRight size={20} className="mb-3 text-primary/50" />
                <Input {...register("promotee.newRank")} placeholder="New Rank" className="text-center bg-black/40 border-primary/20 h-11 rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Reason</label>
                <Input {...register("promotee.reason")} className="bg-black/40 border-white/10 h-11 rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold text-primary/70">Factors of Determination</label>
                <Textarea {...register("factors.departments")} placeholder="Detailed factors for promotion..." className="bg-black/40 border-white/10 rounded-xl resize-none min-h-[100px]" />
              </div>
           </div>
        </SectionCard>

        {/* 4. Session Activity */}
        <SectionCard title="Session Activity" icon={Activity} index={3} isOpen={openSection === "sessions"} isComplete={Object.values(formData.sessionActivity).some(v => v > 0)} onToggle={() => setOpenSection("sessions")}>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(formData.sessionActivity).map(key => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground truncate block">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <Input type="number" {...register(`sessionActivity.${key}` as any)} className="bg-black/40 border-white/10 rounded-lg h-9 text-center font-mono" />
                </div>
              ))}
           </div>
        </SectionCard>

        {/* 5. In-Game Activity */}
        <SectionCard title="In-Game Stats" icon={Trophy} index={4} isOpen={openSection === "ingame"} isComplete={isActivityComplete} onToggle={() => setOpenSection("ingame")}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "minutesThisMonth", label: "Minutes (Month)" },
                { id: "minutesLastMonth", label: "Minutes (Last)" },
                { id: "level", label: "Level" }
              ].map(item => (
                <div key={item.id} className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-primary">{item.label}</label>
                  <Input type="number" {...register(`inGameActivity.${item.id}` as any)} className="bg-black/40 border-white/10 h-10 rounded-lg text-primary font-mono" />
                </div>
              ))}
           </div>
        </SectionCard>

        {/* 6. Maturity & Chats */}
        <SectionCard title="Maturity & Communication" icon={MessageSquare} index={5} isOpen={openSection === "maturity"} isComplete={formData.chats.messages > 0} onToggle={() => setOpenSection("maturity")}>
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Avg Grade</label>
                  <Input type="number" step="0.01" {...register("maturity.averageGrade")} className="bg-black/40 border-white/10 h-10 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-primary">Messages</label>
                  <Input type="number" {...register("chats.messages")} className="bg-black/40 border-white/10 h-10 rounded-lg" />
                </div>
              </div>
              
              {["professionalism", "presence", "grammar"].map(id => (
                <div key={id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-white/50">{id}</span>
                    <span className="text-primary">{id === "grammar" ? (formData.chats as any)[id] : (formData.maturity as any)[id]}%</span>
                  </div>
                  <Slider 
                    min={0} max={100} step={1}
                    value={[id === "grammar" ? (formData.chats as any)[id] : (formData.maturity as any)[id]]}
                    onValueChange={(v) => setValue(id === "grammar" ? `chats.${id}` : `maturity.${id}` as any, v[0])}
                  />
                </div>
              ))}
           </div>
        </SectionCard>

        {/* 7. Departments & History */}
        <SectionCard title="Departments & History" icon={History} index={6} isOpen={openSection === "final"} isComplete={formData.history.length > 0} onToggle={() => setOpenSection("final")}>
           <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS_LIST.map(dept => (
                  <button key={dept} onClick={() => {
                    const curr = formData.departments;
                    setValue("departments", curr.includes(dept) ? curr.filter(d => d !== dept) : [...curr, dept]);
                  }} className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all", formData.departments.includes(dept) ? "bg-primary text-black" : "bg-white/5 text-white/40")}>
                    {dept}
                  </button>
                ))}
              </div>
              
              <div className="space-y-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="grid grid-cols-3 gap-2">
                  <Select onValueChange={(v) => (window as any).tempType = v}>
                    <SelectTrigger className="bg-white/5 border-none h-8 text-[10px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>{HISTORY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Count" type="number" className="h-8 bg-white/5 border-none text-[10px]" onChange={(e) => (window as any).tempCount = e.target.value} />
                  <Button onClick={() => {
                    const type = (window as any).tempType;
                    const count = parseInt((window as any).tempCount);
                    if (type && count) {
                      setValue("history", [...formData.history, { type, count, timeAgo: "1 Month" }]);
                    }
                  }} size="sm" className="h-8 text-[10px]">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {formData.history.map((h, i) => (
                     <Badge key={i} variant="outline" className="gap-2 border-red-500/30 text-red-400">
                       {h.count}x {h.type} <X size={10} className="cursor-pointer" onClick={() => setValue("history", formData.history.filter((_, idx) => idx !== i))} />
                     </Badge>
                   ))}
                </div>
              </div>

              <div className="space-y-1 pt-4">
                 <label className="text-[10px] uppercase font-bold text-primary">Approval</label>
                 <Input {...register("approvedBy")} placeholder="Signature..." className="bg-black/40 border-white/10 h-12 rounded-xl italic font-display text-primary" />
              </div>
              <Button onClick={generate} size="lg" className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-cyan-400 text-black text-xl font-black italic tracking-tighter shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                GENERATE DISCORD LOG <Sparkles className="ml-2" />
              </Button>
           </div>
        </SectionCard>

        {/* Output */}
        <AnimatePresence>
          {generatedLog && openSection === "output" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-4">
              <Card className="glass-panel overflow-hidden border-primary/40">
                <div className="p-4 bg-primary/20 border-b border-white/10 flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Discord Log Ready</h4>
                   <Button onClick={() => {
                      navigator.clipboard.writeText(generatedLog);
                      toast({ title: "Copied!", description: "Paste into Discord now." });
                   }} size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                     <Copy size={14} className="mr-2" /> Copy Log
                   </Button>
                </div>
                <div className="p-8 bg-black/80">
                   <pre className="font-mono text-[11px] text-white/90 whitespace-pre-wrap leading-relaxed select-all">
                      {generatedLog}
                   </pre>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
