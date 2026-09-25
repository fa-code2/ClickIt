import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  ThumbsUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Cpu, 
  Users, 
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const SIMULATOR_DEFECTS = {
  pothole: {
    id: 'pothole',
    name: 'Road Pothole Hazard',
    image: '/images/pothole.jpg',
    category: 'Road Infrastructure & Traffic Safety',
    department: 'Department of Public Works',
    ward: 'Ward 14 (North Zone)',
    reporter: 'Citizen Vikram Rao',
    coords: '23.6912° N, 86.9710° E',
    severity: 'CRITICAL',
    aiConfidence: '98.6% Neural Match',
    tags: ['Crater Depression ~12cm', 'High-Speed Lane Hazard', 'Two-Wheeler Skidding Risk'],
    sla: 'Target SLA: 24 Hours',
    desc: 'Deep asphalt road crater on Sector 4 Main Arterial. Vehicles swerving sharply into oncoming traffic during rush hour.',
    actionProof: 'Cold-mix asphalt compacted, sealed, and steamroller leveled by Zonal Municipal Works Unit #3.'
  },
  garbage: {
    id: 'garbage',
    name: 'Street-Side Garbage Overflow',
    image: '/images/garbage.jpg',
    category: 'Sanitation & Solid Waste Management',
    department: 'Department of Sanitation & Waste Management',
    ward: 'Ward 8 (Central Market Corridor)',
    reporter: 'Citizen Sunita Sen',
    coords: '23.6845° N, 86.9632° E',
    severity: 'HIGH',
    aiConfidence: '97.2% Neural Match',
    tags: ['Decomposing Solid Waste', 'Pedestrian Walkway Blocked', 'Sanitary Biohazard'],
    sla: 'Target SLA: 12 Hours',
    desc: 'Uncollected refuse and overflowing trash heaps obstructing public pedestrian walkway outside City Market entrance.',
    actionProof: 'Heavy hydraulic compactor deployed. Walkway cleared, sanitized, disinfected, and bin collection frequency doubled.'
  }
};

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [upvoted, setUpvoted] = useState(false);
  const [voteCount, setVoteCount] = useState(89);

  // Interactive Simulator State (Snap -> Click/AI -> Post -> Resolve)
  const [activeDefectKey, setActiveDefectKey] = useState('pothole');
  const [activeStage, setActiveStage] = useState(0); // 0: Snap, 1: Click/AI, 2: Post, 3: Resolve
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [simVotes, setSimVotes] = useState({ pothole: 54, garbage: 42 });
  const [hasVotedSim, setHasVotedSim] = useState({ pothole: false, garbage: false });

  useEffect(() => {
    let interval = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveStage((prev) => (prev + 1) % 4);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying]);

  const handleSimVote = (defectKey) => {
    if (hasVotedSim[defectKey]) {
      setSimVotes((prev) => ({ ...prev, [defectKey]: prev[defectKey] - 1 }));
      setHasVotedSim((prev) => ({ ...prev, [defectKey]: false }));
    } else {
      setSimVotes((prev) => ({ ...prev, [defectKey]: prev[defectKey] + 1 }));
      setHasVotedSim((prev) => ({ ...prev, [defectKey]: true }));
    }
  };

  const handleToggleVote = () => {
    if (upvoted) {
      setUpvoted(false);
      setVoteCount((prev) => prev - 1);
    } else {
      setUpvoted(true);
      setVoteCount((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-slate-900 font-sans selection:bg-raspberry selection:text-white">
      {/* Clean Professional Landing Navigation */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b-2 border-vanilla px-4 md:px-10 py-4 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-raspberry text-white flex items-center justify-center font-black shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-2xl text-raspberry tracking-tight">MicroGov</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] bg-vanilla text-raspberry font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-vanilla">
                Civic Governance
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-700">
            <a href="#features" className="hover:text-raspberry transition">Platform Features</a>
            <a href="#how-it-works" className="hover:text-raspberry transition">How It Works</a>
            <a href="#community" className="hover:text-raspberry transition">Community Layer</a>
            <a href="#impact" className="hover:text-raspberry transition">Civic Impact</a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onSignIn}
              className="text-xs font-bold text-slate-800 hover:text-raspberry px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-raspberry hover:bg-pink-grapefruit text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 overflow-hidden border-b-2 border-vanilla">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-vanilla text-raspberry px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-vanilla shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-raspberry" />
              <span>Next-Gen Autonomous Civic Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Empowering Citizens.{' '}
              <span className="text-raspberry">Automating Municipal Resolution.</span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              MicroGov bridges the gap between residents and city administration through multimodal AI defect recognition, dynamic ward authority routing, and a transparent public community layer.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="bg-raspberry hover:bg-pink-grapefruit text-white font-black text-sm px-8 py-4 rounded-2xl transition duration-150 shadow-lg flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <span>Get Started as Citizen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onSignIn}
                className="bg-white hover:bg-vanilla text-slate-800 border-2 border-vanilla font-black text-sm px-6 py-4 rounded-2xl transition duration-150 shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Officer Command Portal</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-vanilla/80 max-w-lg">
              <div>
                <span className="text-2xl font-black text-raspberry block">100%</span>
                <span className="text-[11px] font-bold text-pink-grapefruit uppercase tracking-wider">Dynamic Routing</span>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block">48 Hours</span>
                <span className="text-[11px] font-bold text-pink-grapefruit uppercase tracking-wider">Target SLA</span>
              </div>
              <div>
                <span className="text-2xl font-black text-lime block">Verified</span>
                <span className="text-[11px] font-bold text-pink-grapefruit uppercase tracking-wider">Photo Audit</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-vanilla relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-vanilla pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-raspberry"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Live Incident Dispatch
                  </span>
                </div>
                <span className="text-[10px] bg-lime text-white font-extrabold px-2.5 py-0.5 rounded-md">
                  Active Dispatch
                </span>
              </div>

              {/* Sample Card */}
              <div className="p-4 bg-cream/70 rounded-2xl border border-vanilla space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase bg-vanilla text-raspberry px-2.5 py-0.5 rounded-full">
                    Department of Public Works
                  </span>
                  <span className="text-[11px] font-black text-raspberry bg-white px-2 py-0.5 rounded-md border border-vanilla">
                    Critical Severity
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  Major Road Cave-in on Sector 4 Main Arterial
                </h3>

                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-raspberry" />
                  <span>North District | Central Sector</span>
                </div>

                {/* Stepper Preview */}
                <div className="bg-white p-3 rounded-xl border border-vanilla space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-grapefruit block">
                    Automated Resolution Stepper
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-lime flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reported
                    </span>
                    <span className="text-lime flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Routed
                    </span>
                    <span className="text-raspberry flex items-center gap-1 font-extrabold">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Field Crew
                    </span>
                    <span className="text-slate-300">Verified</span>
                  </div>
                </div>

                {/* Local Authority Binding */}
                <div className="text-xs bg-white p-2.5 rounded-xl border border-vanilla flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned Authority:</span>
                  <span className="font-black text-slate-900">Zonal Public Works Action Office</span>
                </div>

                {/* Real Working Interactive Social Support */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleToggleVote}
                    className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                      upvoted
                        ? 'bg-lime text-white border-lime shadow-xs scale-105'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-vanilla'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? 'fill-white' : 'text-lime'}`} />
                    <span>{voteCount} Citizen Upvotes</span>
                  </button>
                  <span className="text-xs font-bold text-slate-500">Target SLA: 24h</span>
                </div>
              </div>
            </div>

            {/* Subtle soft backdrop accent */}
            <div className="absolute -top-6 -right-6 w-64 h-64 bg-pink-grapefruit/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-vanilla/40 rounded-full blur-3xl -z-0"></div>
          </div>
        </div>
      </header>

      {/* Interactive Incident Resolution Simulator: Snap -> Click -> Post -> Resolve */}
      <section id="simulator" className="py-20 px-4 bg-white border-b-2 border-vanilla relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-vanilla text-raspberry px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-vanilla shadow-2xs">
              <Sparkles className="w-4 h-4 text-raspberry" />
              <span>Interactive Incident Resolution Simulator</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Snap. Click. Post. <span className="text-raspberry">Resolve.</span>
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              Experience the end-to-end lifecycle of civic issues. Choose a real defect, step through AI analysis and community mobilization, and witness verified municipal closure.
            </p>

            {/* Defect Switcher */}
            <div className="pt-3 flex flex-wrap justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveDefectKey('pothole');
                  setActiveStage(0);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition duration-150 cursor-pointer ${
                  activeDefectKey === 'pothole'
                    ? 'bg-raspberry text-white border-raspberry shadow-md scale-102'
                    : 'bg-cream text-slate-700 border-vanilla hover:border-raspberry/50'
                }`}
              >
                <img
                  src="/images/pothole.jpg"
                  alt="Pothole defect"
                  className="w-6 h-6 rounded-lg object-cover border border-white/40"
                />
                <span>Defect 1: Road Pothole Hazard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDefectKey('garbage');
                  setActiveStage(0);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition duration-150 cursor-pointer ${
                  activeDefectKey === 'garbage'
                    ? 'bg-raspberry text-white border-raspberry shadow-md scale-102'
                    : 'bg-cream text-slate-700 border-vanilla hover:border-raspberry/50'
                }`}
              >
                <img
                  src="/images/garbage.jpg"
                  alt="Garbage defect"
                  className="w-6 h-6 rounded-lg object-cover border border-white/40"
                />
                <span>Defect 2: Street Garbage Overflow</span>
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          {(() => {
            const currentDefect = SIMULATOR_DEFECTS[activeDefectKey];
            const stages = [
              { num: '01', title: 'Snap Photo', subtitle: 'Citizen Camera Capture', icon: Camera },
              { num: '02', title: 'Click / AI Scan', subtitle: 'Multimodal Defect Audit', icon: Cpu },
              { num: '03', title: 'Post & Mobilize', subtitle: 'Public Community Layer', icon: Users },
              { num: '04', title: 'Municipal Resolve', subtitle: 'On-Site Verified Audit', icon: ShieldCheck }
            ];

            return (
              <div className="space-y-8">
                {/* Stage Steps Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
                  {stages.map((stage, idx) => {
                    const StageIcon = stage.icon;
                    const isActive = activeStage === idx;
                    const isPassed = activeStage > idx;

                    return (
                      <button
                        key={stage.title}
                        type="button"
                        onClick={() => setActiveStage(idx)}
                        className={`p-4 rounded-2xl border-2 text-left transition duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isActive
                            ? 'bg-raspberry text-white border-raspberry shadow-md scale-102'
                            : isPassed
                            ? 'bg-cream text-slate-800 border-lime/60'
                            : 'bg-cream/40 text-slate-600 border-vanilla hover:bg-cream'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : isPassed
                                ? 'bg-lime text-white'
                                : 'bg-vanilla text-slate-700'
                            }`}
                          >
                            Step {stage.num}
                          </span>
                          <StageIcon className={`w-4 h-4 ${isActive ? 'text-white' : isPassed ? 'text-lime' : 'text-slate-400'}`} />
                        </div>
                        <h4 className="font-black text-sm tracking-tight">{stage.title}</h4>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-vanilla' : 'text-slate-500'}`}>
                          {stage.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Simulator Interactive Stage Box */}
                <div className="bg-cream/60 rounded-3xl border-2 border-vanilla p-6 md:p-10 shadow-sm max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Defect Photo & Stage Viewfinder Overlay */}
                  <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-vanilla shadow-lg bg-slate-900 group">
                    <img
                      src={currentDefect.image}
                      alt={currentDefect.name}
                      className="w-full h-80 sm:h-96 object-cover transition duration-500"
                    />

                    {/* Stage 0 Overlay: Snap Photo Viewfinder */}
                    {activeStage === 0 && (
                      <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none animate-fadeIn bg-slate-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            <span>LIVE CAMERA REC</span>
                          </div>
                          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-xl">
                            {currentDefect.coords}
                          </span>
                        </div>

                        {/* Viewfinder Target Reticle */}
                        <div className="w-48 h-48 mx-auto border-2 border-dashed border-white/80 rounded-2xl flex items-center justify-center relative">
                          <div className="w-3 h-3 border-t-2 border-l-2 border-white absolute top-2 left-2"></div>
                          <div className="w-3 h-3 border-t-2 border-r-2 border-white absolute top-2 right-2"></div>
                          <div className="w-3 h-3 border-b-2 border-l-2 border-white absolute bottom-2 left-2"></div>
                          <div className="w-3 h-3 border-b-2 border-r-2 border-white absolute bottom-2 right-2"></div>
                          <Camera className="w-8 h-8 text-white/90 animate-pulse" />
                        </div>

                        <div className="bg-slate-900/85 backdrop-blur-md text-white p-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
                          <span>Captured by {currentDefect.reporter}</span>
                          <span className="text-vanilla font-mono">Geotagged & Ready</span>
                        </div>
                      </div>
                    )}

                    {/* Stage 1 Overlay: AI Scan & Defect Recognition */}
                    {activeStage === 1 && (
                      <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none animate-fadeIn bg-slate-900/30">
                        {/* Scanning Laser Line */}
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-raspberry to-transparent animate-bounce shadow-lg top-1/3"></div>

                        <div className="flex items-center justify-between">
                          <div className="bg-raspberry text-white text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 animate-spin" />
                            <span>Neural Defect Audit</span>
                          </div>
                          <span className="bg-white/95 text-slate-900 text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                            {currentDefect.aiConfidence}
                          </span>
                        </div>

                        {/* Defect Bounding Box */}
                        <div className="border-2 border-raspberry bg-raspberry/15 rounded-2xl p-4 mx-auto max-w-xs text-center text-white backdrop-blur-xs shadow-xl">
                          <span className="bg-raspberry text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mb-1">
                            Severity: {currentDefect.severity}
                          </span>
                          <p className="font-extrabold text-sm">{currentDefect.name}</p>
                          <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {currentDefect.tags.map((tag) => (
                              <span key={tag} className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-md font-bold text-vanilla">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl text-xs font-bold flex items-center justify-between">
                          <span>Auto-Routing to:</span>
                          <span className="text-lemon">{currentDefect.department}</span>
                        </div>
                      </div>
                    )}

                    {/* Stage 2 Overlay: Community Feed Card */}
                    {activeStage === 2 && (
                      <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none animate-fadeIn bg-slate-900/35">
                        <div className="flex items-center justify-between">
                          <div className="bg-lime text-white text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Live Community Feed</span>
                          </div>
                          <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-xl">
                            {currentDefect.ward}
                          </span>
                        </div>

                        <div className="bg-white/95 backdrop-blur-md text-slate-900 p-4 rounded-2xl shadow-xl space-y-2 pointer-events-auto">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-raspberry">{currentDefect.category}</span>
                            <span className="text-[11px] font-bold text-slate-500">Target SLA: 24h</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium">
                            "{currentDefect.desc}"
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleSimVote(activeDefectKey)}
                              className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                                hasVotedSim[activeDefectKey]
                                  ? 'bg-lime text-white border-lime shadow-xs scale-105'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-vanilla'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${hasVotedSim[activeDefectKey] ? 'fill-white' : 'text-lime'}`} />
                              <span>{simVotes[activeDefectKey]} Citizen Upvotes</span>
                            </button>
                            <span className="text-[11px] font-bold text-slate-500">Escalated Priority</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/85 backdrop-blur-md text-white p-2.5 rounded-2xl text-[11px] font-medium text-center">
                          Ward Councilor & Zonal Authority Automatically Notified
                        </div>
                      </div>
                    )}

                    {/* Stage 3 Overlay: Municipal Resolved & Verified */}
                    {activeStage === 3 && (
                      <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none animate-fadeIn bg-slate-900/40">
                        <div className="flex items-center justify-between">
                          <div className="bg-lime text-white text-xs font-black px-3.5 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Work Order Closed</span>
                          </div>
                          <span className="bg-white text-slate-900 text-xs font-black px-3 py-1 rounded-xl">
                            Verified Audit
                          </span>
                        </div>

                        {/* Resolution Stamp */}
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border-2 border-lime text-slate-900 shadow-2xl space-y-2 text-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-full bg-lime text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <h4 className="font-black text-base text-slate-900 uppercase tracking-tight">
                            Defect Repaired & Verified
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">
                            {currentDefect.actionProof}
                          </p>
                          <div className="pt-2 border-t border-vanilla flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>Field Team #04</span>
                            <span className="text-lime">100% SLA Compliance</span>
                          </div>
                        </div>

                        <div className="bg-lime/90 backdrop-blur-md text-white p-2.5 rounded-2xl text-xs font-black text-center shadow-md">
                          Civic Ticket Closed with After-Repair Photographic Audit
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Stage Step Details and Interactive Control Buttons */}
                  <div className="lg:col-span-6 space-y-5 text-left">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider bg-raspberry text-white px-3 py-0.5 rounded-full">
                          Stage {activeStage + 1} of 4
                        </span>
                        <span className="text-xs text-pink-grapefruit font-extrabold">
                          {currentDefect.category}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {activeStage === 0 && '1. Citizen Snaps Photo On-Site'}
                        {activeStage === 1 && '2. AI Scans & Computes Severity'}
                        {activeStage === 2 && '3. Dispatched to Feed & Ward CC'}
                        {activeStage === 3 && '4. Municipal Repair Verified with Photo'}
                      </h3>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        {activeStage === 0 &&
                          'A resident spots a civic hazard, snaps a timestamped photo through MicroGov, and the device captures high-precision coordinates for automated GIS mapping.'}
                        {activeStage === 1 &&
                          'Multimodal neural networks assess surface damage dimensions, categorize the failure (Public Works vs. Sanitation), and calculate dynamic SLA urgency.'}
                        {activeStage === 2 &&
                          'The issue is published to the neighborhood civic social layer. Neighbors cast verified upvotes, escalating priority while routing notices to local ward officers.'}
                        {activeStage === 3 &&
                          'The municipal field crew executes the repair and uploads an on-site verification photo. The ticket cannot be closed without photographic proof.'}
                      </p>
                    </div>

                    {/* Detailed Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border-2 border-vanilla">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Assigned Department
                        </span>
                        <span className="text-xs font-black text-slate-900">{currentDefect.department}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Local Jurisdiction
                        </span>
                        <span className="text-xs font-black text-raspberry">{currentDefect.ward}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Target Resolution SLA
                        </span>
                        <span className="text-xs font-black text-slate-900">{currentDefect.sla}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Current Stage Status
                        </span>
                        <span className="text-xs font-black text-lime">
                          {activeStage === 3 ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveStage((prev) => (prev > 0 ? prev - 1 : 3))}
                        className="py-3 px-4 rounded-xl border-2 border-vanilla text-xs font-bold text-slate-700 hover:bg-cream transition cursor-pointer"
                      >
                        &larr; Previous Stage
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStage((prev) => (prev < 3 ? prev + 1 : 0))}
                        className="py-3 px-5 rounded-xl bg-raspberry hover:bg-pink-grapefruit text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        <span>{activeStage === 3 ? 'Restart Cycle' : 'Next Stage'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isAutoPlaying
                            ? 'bg-lime text-white border-lime shadow-xs'
                            : 'bg-white border-vanilla text-slate-700 hover:bg-cream'
                        }`}
                      >
                        {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isAutoPlaying ? 'Auto-Playing' : 'Auto-Play'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStage(0)}
                        className="p-3 rounded-xl border-2 border-vanilla text-slate-600 hover:bg-cream transition cursor-pointer"
                        title="Reset to Stage 1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Core Platform Features */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-raspberry bg-vanilla px-3 py-1 rounded-full border border-vanilla">
            Core Innovations
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Built for Transparency and Action
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base">
            MicroGov transforms municipal problem-solving from slow bureaucracy into a modern, data-driven, community-backed ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-vanilla shadow-xs space-y-4 hover:border-pink-grapefruit/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center font-black">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Multimodal AI Defect Auditing</h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Upload photos or dictate voice memos. Computer vision models automatically assess damage severity, categorize the defect, and calculate priority indices.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-vanilla shadow-xs space-y-4 hover:border-pink-grapefruit/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center font-black">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Dynamic Civic Routing</h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Every complaint is dynamically dispatched to the exact responsible department and CC'd to the citizen's local ward office and zonal executive engineer.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-vanilla shadow-xs space-y-4 hover:border-pink-grapefruit/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center font-black">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Public Community Layer</h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Explore your district's civic social feed. Support critical local issues with upvotes, participate in discussions, and track resolutions in the open.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-vanilla shadow-xs space-y-4 hover:border-pink-grapefruit/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Verified Photo Audit</h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              No closed work orders without proof. Municipal field officers must upload timestamped after-repair verification photos before complaints can be marked resolved.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Step-by-Step */}
      <section id="how-it-works" className="py-20 px-4 bg-white border-y-2 border-vanilla">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-raspberry bg-vanilla px-3 py-1 rounded-full border border-vanilla">
              Four-Stage Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              From Citizen Report to Verified Solution
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              A transparent, automated cycle designed to eliminate bureaucratic bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-cream/80 rounded-3xl border-2 border-vanilla space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-raspberry text-white font-black text-xs flex items-center justify-center">1</span>
              <h4 className="text-base font-black text-slate-900">Capture Incident</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Citizen snaps a photo of a broken street, leak, or garbage hazard with optional description and GPS location.
              </p>
            </div>

            <div className="p-6 bg-cream/80 rounded-3xl border-2 border-vanilla space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-raspberry text-white font-black text-xs flex items-center justify-center">2</span>
              <h4 className="text-base font-black text-slate-900">Intelligent Routing</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                MicroGov engine resolves the responsible department and local jurisdiction based on issue category and coordinates.
              </p>
            </div>

            <div className="p-6 bg-cream/80 rounded-3xl border-2 border-vanilla space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-raspberry text-white font-black text-xs flex items-center justify-center">3</span>
              <h4 className="text-base font-black text-slate-900">Community Backing</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Neighborhood residents view the report on the community feed, upvoting to escalate priority and posting ground updates.
              </p>
            </div>

            <div className="p-6 bg-cream/80 rounded-3xl border-2 border-vanilla space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-lime text-white font-black text-xs flex items-center justify-center">4</span>
              <h4 className="text-base font-black text-slate-900">Verified Closure</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Field team executes the work order, uploads an on-site after-repair verification photo, and closes the ticket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section Highlight */}
      <section id="community" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border-2 border-vanilla p-8 md:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-black uppercase tracking-wider text-raspberry bg-vanilla px-3 py-1 rounded-full border border-vanilla">
                Civic Social Network
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Civic Governance Powered by Community Voices
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                Never report into a void again. MicroGov's public community layer functions like a social platform for civic action. See what is happening around your street, support your neighbors' complaints, and watch the resolution progress in real time.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-lime shrink-0" />
                  <span>Transparent Upvotes & Downvotes per verified resident</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-lime shrink-0" />
                  <span>Real-time status notifications at every stage of resolution</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-lime shrink-0" />
                  <span>Filter by specific Civic Area or Municipal Department</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onGetStarted}
                  className="bg-raspberry hover:bg-pink-grapefruit text-white font-black text-xs px-6 py-3.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore the Community Feed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-cream p-6 rounded-3xl border-2 border-vanilla space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-pink-grapefruit">
                  Sample Community Discussions
                </h4>

                <div className="bg-white p-4 rounded-2xl border border-vanilla space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-900">Dr. Ananya Sen</span>
                    <span className="text-[10px] text-slate-400">Central District</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    "Trash overflow on Market Road has been completely cleared by the quick response team. Verified!"
                  </p>
                  <span className="text-[10px] font-black text-lime">Verified Resolution Attached</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-vanilla space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-900">Rohan Deshmukh</span>
                    <span className="text-[10px] text-slate-400">North District</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    "Zonal public works acknowledged the pothole report. Field crew scheduled for inspection."
                  </p>
                  <span className="text-[10px] font-black text-lemon">Field Order In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section id="impact" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="bg-raspberry text-white rounded-3xl p-10 md:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Ready to Build a Better City Together?
          </h2>
          <p className="text-vanilla font-medium max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Join your neighbors, register your civic area, and start filing actionable work orders that get solved.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-white hover:bg-vanilla text-raspberry font-black text-sm px-8 py-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="bg-raspberry/30 hover:bg-raspberry/50 text-white border-2 border-vanilla font-black text-sm px-8 py-4 rounded-2xl transition w-full sm:w-auto cursor-pointer"
            >
              <span>Officer Portal Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-vanilla py-10 px-4 text-slate-600 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-raspberry" />
            <span className="font-black text-slate-900 text-sm">MicroGov Platform</span>
            <span className="text-slate-400">|</span>
            <span>Autonomous Civic Governance & Municipal Resolution Engine</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500 font-semibold">
            <span>Dynamic AI Dispatch</span>
            <span>&bull;</span>
            <span>Civic Upvoting</span>
            <span>&bull;</span>
            <span>Verified Photo Audit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
