import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from "@/components/ui/carousel";
import { useLocation } from "wouter";
import {
	CheckCircle,
	ChevronRight,
	FileCheck,
	Pen,
	Users,
	Shield,
	Star,
	Mail,
	Calendar,
	BarChart,
	ArrowRight,
	MessageSquare,
	PieChart,
	Activity,
	TrendingUp,
	TrendingDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { TestimonialCard } from "@/components/testimonial-card";
import { FeatureCard } from "@/components/feature-card";
import { PricingCard } from "@/components/pricing-card";
import { StatsCard } from "@/components/stats-card";
import { DashboardMockup } from "@/components/dashboard-mockup";
// import { HeroHeader } from "@/components/hero-header";
import { ClientLogos } from "@/components/client-logos";
import Balatro from "@/components/ui/balatro";

export default function Home() {
	const [, navigate] = useLocation();
	const [scrolled, setScrolled] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Set dark mode by default
		document.documentElement.classList.add("dark");

		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);

		// Simulate loading state
		setTimeout(() => setIsLoading(false), 500);

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-900">
				<div className="flex flex-col items-center">
					<div className="w-16 h-16 relative">
						<div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#FF9F5A] border-r-[#FFCC66] border-b-[#FF9F5A] border-l-[#FFCC66] rounded-full animate-spin" />
					</div>
					<p className="mt-4 text-white text-lg">Loading GigGuard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col dark bg-gray-900">
			{/* Floating Header with Glassmorphism */}
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled
						? "bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-800/50"
						: "bg-transparent"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
					<div className="h-auto w-24">
						<img
							src="/logo.svg"
							alt="GigGuard Logo"
							className="w-full h-full"
						/>
					</div>

					<nav className="hidden md:flex space-x-8">
						<a
							href="#features"
							className="text-gray-300 hover:text-[#ff6000] transition-colors"
						>
							Features
						</a>
						<a
							href="#dashboard"
							className="text-gray-300 hover:text-[#ff6000] transition-colors"
						>
							Dashboard
						</a>
						<a
							href="#testimonials"
							className="text-gray-300 hover:text-[#ff6000] transition-colors"
						>
							Testimonials
						</a>
						<a
							href="#pricing"
							className="text-gray-300 hover:text-[#ff6000] transition-colors"
						>
							Pricing
						</a>
						<a
							href="#faq"
							className="text-gray-300 hover:text-[#ff6000] transition-colors"
						>
							FAQ
						</a>
					</nav>

					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							onClick={() => navigate("/login")}
							className="hidden md:inline-flex text-gray-300 hover:text-white"
						>
							Log in
						</Button>
						<Button
							onClick={() => navigate("/login")}
							className="bg-gradient-to-r from-[#ff4800] to-[#ff6000] hover:from-[#ff5400] hover:to-[#ff6000] text-white relative overflow-hidden"
						>
							<span className="relative z-10">Start Free Trial</span>
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-grow">
				{/* Hero Section with Dashboard Preview */}
				<section className="pt-28 pb-16 md:pt-36 md:pb-24 relative overflow-hidden">
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-0" />

					{/* Animated Gradient Blobs */}
					<div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-[#ff4800]/10 to-[#ff5400]/10 rounded-full blur-3xl animate-pulse z-0" />
					<div
						className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-[#ff4800]/10 to-[#ff5400]/10 rounded-full blur-3xl animate-pulse z-0"
						style={{ animationDelay: "1s" }}
					/>

					{/* Grid Pattern Overlay */}
					<div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0" />

					{/* Content */}
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
						<div className="grid grid-cols-1 gap-12 items-center">
							<div className="flex flex-col items-center">
								<Badge className="mb-4 bg-white/10 hover:bg-white/10 text-[#ff6000] hover:border hover:border-[#ff4800] px-4 py-1">
									<Star className="h-3 w-3 mr-1" />
									Trusted by 2,500+ freelancers
								</Badge>

								<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-center">
									<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff6000] to-[#ff9e00]">
										Freelance Business Management
									</span>{" "}
									<br />
									<span className="text-[#ffb600]">on Autopilot</span>
								</h1>

								<p className="mt-6 text-xl text-gray-300 max-w-lg text-center">
									Create professional contracts, get them signed, and automate
									your invoicing workflow—all in one dashboard. Save 10+ hours
									every week.
								</p>

								<div className="mt-8 flex flex-col sm:flex-row gap-4">
									<Button
										size="lg"
										onClick={() => navigate("/login")}
										className="bg-gradient-to-r from-[#ff4800] to-[#ff6000] hover:from-[#ff5400] hover:to-[#ff6000] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all group"
									>
										Start Free 14-Day Trial
										<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
									</Button>

									<Button
										size="lg"
										variant="outline"
										onClick={() =>
											document
												.getElementById("dashboard")
												?.scrollIntoView({ behavior: "smooth" })
										}
										className="px-8 py-6 text-lg rounded-xl bg-white/90 hover:text-[#ff6000] border-none text-[#ff6000] hover:bg-white/80 transition-all group"
									>
										Watch Demo <MessageSquare className="ml-2 h-5 w-5" />
									</Button>
								</div>

								<div className="mt-8 flex items-center">
									<div className="flex -space-x-2">
										{[1, 2, 3, 4].map((i) => (
											<div
												key={i}
												className={`w-8 h-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-gray-${400 + i * 100} to-gray-${300 + i * 100}`}
											/>
										))}
									</div>
									<div className="ml-4">
										<div className="text-sm text-gray-400">
											Trusted by freelancers from
										</div>
										<div className="text-sm font-medium text-white">
											32+ countries worldwide
										</div>
									</div>
								</div>
							</div>

							<div className="relative">
								<div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff4800] to-[#ff6000] rounded-2xl blur opacity-30" />
								<div className="relative bg-gray-800 p-1 rounded-2xl shadow-xl">
									<DashboardMockup />
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Client Logos Section */}
				<section className="py-12 bg-gray-900/80 border-y border-gray-800/50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<p className="text-center text-sm uppercase tracking-wider text-gray-500 mb-8">
							TRUSTED BY FREELANCERS FROM LEADING COMPANIES
						</p>
						<ClientLogos />
					</div>
				</section>

				{/* Stats Section */}
				<section className="py-20 bg-gray-900 relative">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<StatsCard
								icon={<FileCheck className="h-6 w-6" />}
								title="Contracts Created"
								value="125,000+"
								description="Legal documents generated"
								trend="up"
								percentage="32%"
							/>

							<StatsCard
								icon={<Users className="h-6 w-6" />}
								title="Active Users"
								value="2,500+"
								description="Freelancers worldwide"
								trend="up"
								percentage="18%"
							/>

							<StatsCard
								icon={<PieChart className="h-6 w-6" />}
								title="Time Saved"
								value="320,000+"
								description="Hours saved collectively"
								trend="up"
								percentage="45%"
							/>

							<StatsCard
								icon={<Shield className="h-6 w-6" />}
								title="Payment Protection"
								value="$28M+"
								description="In secured payments"
								trend="up"
								percentage="27%"
							/>
						</div>
					</div>
				</section>

				{/* Dashboard Preview Section */}
				{/* <section
					id="dashboard"
					className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<Badge className="mb-4 bg-white/20 text-[#ff6000] hover:bg-white/20 hover:border-[#ff4800] px-4 py-1">
								All-in-one platform
							</Badge>

							<h2 className="text-3xl md:text-4xl font-bold text-white">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff4800] to-[#ff6000]">
									Meet Your New Business Hub
								</span>
							</h2>

							<p className="mt-4 text-xl text-gray-300">
								Everything you need to manage your freelance business,
								accessible from anywhere.
							</p>
						</div>

						<Tabs defaultValue="contracts" className="w-full">
							<div className="flex justify-center mb-8">
								<TabsList className="bg-gray-800/70 backdrop-blur border border-gray-700/50 p-1">
									<TabsTrigger
										value="contracts"
										className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff4800] data-[state=active]:to-[#ff6000] data-[state=active]:text-white"
									>
										Contracts
									</TabsTrigger>
									<TabsTrigger
										value="invoices"
										className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff4800] data-[state=active]:to-[#ff6000] data-[state=active]:text-white"
									>
										Invoicing
									</TabsTrigger>
									<TabsTrigger
										value="clients"
										className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff4800] data-[state=active]:to-[#ff6000] data-[state=active]:text-white"
									>
										Client Portal
									</TabsTrigger>
									<TabsTrigger
										value="analytics"
										className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff4800] data-[state=active]:to-[#ff6000] data-[state=active]:text-white"
									>
										Analytics
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="contracts" className="mt-0">
								<div className="relative">
									<div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] rounded-2xl blur opacity-30" />
									<div className="relative bg-gray-800 p-1 rounded-2xl shadow-2xl">
										<img
											src="/dashboard-contracts.png"
											alt="Contracts Dashboard"
											className="w-full h-auto rounded-xl border border-gray-700"
										/>
										<div className="absolute bottom-4 right-4 flex space-x-2">
											<Badge className="bg-[#ff6d00] hover:bg-[#ff7900] text-white">
												Contract Templates
											</Badge>
											<Badge className="bg-[#ffb600] hover:bg-[#ffaa00] text-white">
												E-Signatures
											</Badge>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="invoices" className="mt-0">
								<div className="relative">
									<div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] rounded-2xl blur opacity-30" />
									<div className="relative bg-gray-800 p-1 rounded-2xl shadow-2xl">
										<img
											src="/dashboard-invoices.png"
											alt="Invoices Dashboard"
											className="w-full h-auto rounded-xl border border-gray-700"
										/>
										<div className="absolute bottom-4 right-4 flex space-x-2">
											<Badge className="bg-[#ff6d00] hover:bg-[#ff7900] text-white">
												Payment Tracking
											</Badge>
											<Badge className="bg-[#ffb600] hover:bg-[#ffaa00] text-white">
												Auto Reminders
											</Badge>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="clients" className="mt-0">
								<div className="relative">
									<div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] rounded-2xl blur opacity-30" />
									<div className="relative bg-gray-800 p-1 rounded-2xl shadow-2xl">
										<img
											src="/dashboard-clients.png"
											alt="Client Management Dashboard"
											className="w-full h-auto rounded-xl border border-gray-700"
										/>
										<div className="absolute bottom-4 right-4 flex space-x-2">
											<Badge className="bg-[#ff6d00] hover:bg-[#ff7900] text-white">
												Client Portal
											</Badge>
											<Badge className="bg-[#ffb600] hover:bg-[#ffaa00] text-white">
												Communication Hub
											</Badge>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="analytics" className="mt-0">
								<div className="relative">
									<div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] rounded-2xl blur opacity-30" />
									<div className="relative bg-gray-800 p-1 rounded-2xl shadow-2xl">
										<img
											src="/dashboard-analytics.png"
											alt="Analytics Dashboard"
											className="w-full h-auto rounded-xl border border-gray-700"
										/>
										<div className="absolute bottom-4 right-4 flex space-x-2">
											<Badge className="bg-[#ff6d00] hover:bg-[#ff7900] text-white">
												Income Analysis
											</Badge>
											<Badge className="bg-[#ffb600] hover:bg-[#ffaa00] text-white">
												Business Insights
											</Badge>
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</section> */}

				{/* Features Section */}
				<section id="features" className="py-16 bg-gray-900 relative">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<Badge className="mb-4 bg-white/20 text-[#ff6000] hover:bg-white/20 hover:border-[#ff4800] px-4 py-1">
								Core Features
							</Badge>

							<h2 className="text-3xl md:text-4xl font-bold text-white">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff4800] to-[#ff6000]">
									End-to-End Freelance Business Management
								</span>
							</h2>

							<p className="mt-4 text-xl text-gray-300">
								Everything you need to run your freelance business
								professionally
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							<FeatureCard
								icon={<FileCheck className="h-6 w-6" />}
								title="Legal Contract Templates"
								description="Choose from our library of attorney-drafted contract templates tailored for freelancers across dozens of industries."
								color="from-[#ff6d00] to-[#ff7900]"
							/>

							<FeatureCard
								icon={<CheckCircle className="h-6 w-6" />}
								title="E-Signatures"
								description="Collect legally-binding electronic signatures from clients anywhere in the world, no account required."
								color="from-[#ff6d00] to-[#ff7900]"
							/>

							<FeatureCard
								icon={<BarChart className="h-6 w-6" />}
								title="Automated Invoicing"
								description="Generate professional invoices automatically from your contracts, with recurring options and payment tracking."
								color="from-[#ff6d00] to-[#ff7900]"
							/>

							<FeatureCard
								icon={<Users className="h-6 w-6" />}
								title="Client Management"
								description="Centralize client information, communication, and project details in one secure location."
								color="from-[#ff6d00] to-[#ff7900]"
							/>

							<FeatureCard
								icon={<Calendar className="h-6 w-6" />}
								title="Payment Reminders"
								description="Schedule automatic payment reminders for clients to ensure you get paid on time, every time."
								color="from-[#ff6d00] to-[#ff7900]"
							/>

							<FeatureCard
								icon={<Activity className="h-6 w-6" />}
								title="Business Analytics"
								description="Track your income, outstanding payments, and business growth with visual analytics and reports."
								color="from-[#ff6d00] to-[#ff7900]"
							/>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section
					id="testimonials"
					className="py-16 bg-gray-900 relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<Badge className="mb-4 bg-white/20 text-[#ff6000] hover:bg-white/20 hover:border-[#ff4800] px-4 py-1">
								<Star className="h-3 w-3 mr-1" />
								Freelancer Success Stories
							</Badge>

							<h2 className="text-3xl md:text-4xl font-bold text-white">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff6d00] to-[#ff7900]">
									See What Other Freelancers Say
								</span>
							</h2>

							<p className="mt-4 text-xl text-gray-300">
								Join thousands of freelancers who've transformed their business
								with GigGuard
							</p>
						</div>

						<Carousel className="w-full">
							<CarouselContent>
								<CarouselItem className="md:basis-1/2 lg:basis-1/3">
									<TestimonialCard
										quote="GigGuard has been a game-changer for my design business. I've cut admin time by 70% and clients are impressed with how professional everything looks."
										author="Sarah Johnson"
										jobTitle="UI/UX Designer"
										avatarSrc="/testimonial-1.jpg"
										rating={5}
									/>
								</CarouselItem>

								<CarouselItem className="md:basis-1/2 lg:basis-1/3">
									<TestimonialCard
										quote="The contract templates alone are worth the subscription. They've helped me avoid scope creep and get paid faster. The dashboard makes everything so easy to manage."
										author="Michael Chen"
										jobTitle="Web Developer"
										avatarSrc="/testimonial-2.jpg"
										rating={5}
									/>
								</CarouselItem>

								<CarouselItem className="md:basis-1/2 lg:basis-1/3">
									<TestimonialCard
										quote="My clients love the professional experience, and I love how much time I'm saving. The analytics help me understand my business better than ever."
										author="Alicia Martinez"
										jobTitle="Content Writer"
										avatarSrc="/testimonial-3.jpg"
										rating={5}
									/>
								</CarouselItem>

								<CarouselItem className="md:basis-1/2 lg:basis-1/3">
									<TestimonialCard
										quote="After struggling with late payments for years, GigGuard's automated invoicing and reminders have completely solved that problem. Highly recommended!"
										author="James Wilson"
										jobTitle="Marketing Consultant"
										avatarSrc="/testimonial-4.jpg"
										rating={5}
									/>
								</CarouselItem>
							</CarouselContent>

							<div className="flex justify-center mt-8">
								<CarouselPrevious className="static transform-none mr-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white" />
								<CarouselNext className="static transform-none ml-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white" />
							</div>
						</Carousel>
					</div>
				</section>

				{/* Pricing Section */}
				{/* <section
					id="pricing"
					className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<Badge className="mb-4 bg-white/10 text-[#FFCC66] hover:bg-white/20 px-4 py-1">
								Simple Pricing
							</Badge>

							<h2 className="text-3xl md:text-4xl font-bold text-white">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66]">
									Plans That Scale With Your Business
								</span>
							</h2>

							<p className="mt-4 text-xl text-gray-300">
								No hidden fees or complicated tiers. Just straightforward
								pricing.
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
							<PricingCard
								title="Starter"
								price="$19"
								period="per month"
								description="Perfect for new freelancers"
								features={[
									"Up to 5 active contracts",
									"Unlimited e-signatures",
									"Basic invoice generation",
									"Email support",
									"Client portal",
								]}
								buttonText="Start Free Trial"
								onClick={() => navigate("/login")}
								popular={false}
							/>

							<PricingCard
								title="Professional"
								price="$39"
								period="per month"
								description="Most popular for established freelancers"
								features={[
									"Unlimited active contracts",
									"Custom contract templates",
									"Automated payment reminders",
									"Business analytics dashboard",
									"Priority support",
									"Client CRM features",
								]}
								buttonText="Start Free Trial"
								onClick={() => navigate("/login")}
								popular={true}
							/>

							<PricingCard
								title="Agency"
								price="$99"
								period="per month"
								description="For teams and agencies"
								features={[
									"Everything in Professional",
									"Team collaboration tools",
									"Advanced analytics",
									"White-labeled client portal",
									"Custom branding",
									"API access",
									"Dedicated account manager",
								]}
								buttonText="Contact Sales"
								onClick={() => navigate("/contact")}
								popular={false}
							/>
						</div>

						<div className="mt-12 text-center">
							<p className="text-lg text-gray-300">
								Not sure which plan is right for you?{" "}
								<Button
									variant="link"
									className="text-[#FFCC66] hover:text-[#FF9F5A] p-0 h-auto"
								>
									Schedule a demo
								</Button>
							</p>
						</div>
					</div>
				</section> */}

				{/* FAQ Section */}
				<section id="faq" className="py-16 bg-gray-900">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<Badge className="mb-4 bg-white/10 text-[#ff6000] hover:border-[#ff4800] hover:bg-white/10 px-4 py-1">
								FAQs
							</Badge>

							<h2 className="text-3xl md:text-4xl font-bold text-white">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff4800] to-[#ff6000]">
									Frequently Asked Questions
								</span>
							</h2>
						</div>

						<div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
							<Tabs defaultValue="general" className="w-full">
								<TabsList className="grid grid-cols-3 mb-6">
									<TabsTrigger
										value="general"
										className="data-[state=active]:text-[#ff6000]"
									>
										General
									</TabsTrigger>
									<TabsTrigger
										value="billing"
										className="data-[state=active]:text-[#ff6000]"
									>
										Billing
									</TabsTrigger>
									<TabsTrigger
										value="features"
										className="data-[state=active]:text-[#ff6000]"
									>
										Features
									</TabsTrigger>
								</TabsList>

								<TabsContent value="general" className="mt-0 space-y-4">
									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											What is GigGuard?
										</h3>
										<p className="text-gray-300">
											GigGuard is an all-in-one platform designed specifically
											for freelancers to manage contracts, e-signatures,
											invoices, client relationships, and business analytics in
											one centralized dashboard.
										</p>
									</div>

									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											How long is the free trial?
										</h3>
										<p className="text-gray-300">
											Our free trial lasts for 14 days, giving you full access
											to all features of your selected plan with no credit card
											required to start.
										</p>
									</div>

									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											Do I need technical skills to use GigGuard?
										</h3>
										<p className="text-gray-300">
											Not at all! GigGuard is designed to be user-friendly with
											an intuitive interface. If you can use email, you can use
											GigGuard.
										</p>
									</div>
								</TabsContent>

								<TabsContent value="billing" className="mt-0 space-y-4">
									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											Can I upgrade or downgrade my plan?
										</h3>
										<p className="text-gray-300">
											Yes, you can upgrade or downgrade your plan at any time.
											The new pricing will be prorated for the remainder of your
											billing cycle.
										</p>
									</div>

									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											Do you offer annual billing?
										</h3>
										<p className="text-gray-300">
											Yes, we offer annual billing with a 20% discount compared
											to monthly billing. You can select this option during
											signup or switch later.
										</p>
									</div>

									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											What payment methods do you accept?
										</h3>
										<p className="text-gray-300">
											We accept all major credit cards, PayPal, and bank
											transfers for annual plans. All payments are securely
											processed.
										</p>
									</div>
								</TabsContent>

								<TabsContent value="features" className="mt-0 space-y-4">
									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											Are the contract templates legally binding?
										</h3>
										<p className="text-gray-300">
											Yes, all our contract templates are drafted by attorneys
											and are legally binding in most jurisdictions. We
											regularly update them to comply with changing laws.
										</p>
									</div>

									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											Can I customize the contract templates?
										</h3>
										<p className="text-gray-300">
											Absolutely. All templates are fully customizable to your
											specific needs while maintaining their legal integrity.
										</p>
									</div>

									<div className="rounded-xl bg-gray-800/80 p-6 border border-gray-700/50">
										<h3 className="text-lg font-medium text-white mb-2">
											Can clients pay invoices directly through GigGuard?
										</h3>
										<p className="text-gray-300">
											Yes, clients can pay invoices directly through GigGuard
											via credit card, PayPal, or bank transfer, depending on
											your preferences.
										</p>
									</div>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-16 relative overflow-hidden mx-36 rounded-2xl shadow-2xl mb-12">
					<div className="absolute inset-0 z-0 pointer-events-none w-full h-full blur-[2px]">
						<Balatro
							isRotate={false}
							mouseInteraction={true}
							pixelFilter={2000}
							className="w-full h-full opacity-30"
						/>
					</div>

					{/* Animated Gradient Blobs */}
					<div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl animate-pulse" />
					<div
						className="absolute bottom-1/2 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl animate-pulse"
						style={{ animationDelay: "1s" }}
					/>

					<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
						<h2 className="text-3xl md:text-4xl font-extrabold text-black">
							Ready to transform your freelance business?
						</h2>

						<p className="mt-6 text-xl text-black max-w-2xl mx-auto">
							Join thousands of freelancers who are saving time, getting paid
							faster, and impressing clients with professional contracts and
							invoices.
						</p>

						<div className="mt-10 flex flex-col sm:flex-row justify-center items-center bg-white/90 max-w-lg mx-auto rounded-xl py-1 px-2">
							<Button
								size="lg"
								onClick={() => navigate("/login")}
								className=" text-[#ff4800] text-lg rounded-xl transition-all"
							>
								Start Your 14-Day Free Trial
							</Button>

							<Button
								size="lg"
								variant="outline"
								onClick={() =>
									window.open("https://calendly.com/gigguard/demo", "_blank")
								}
								className="px-10 py-4 text-lg rounded-xl bg-[#ff4800] border-0 text-white hover:text-white hover:bg-[#ff6000] transition-all mr-2"
							>
								Schedule a Demo
							</Button>
						</div>

						<div className="mt-8 text-black">
							No credit card required • 14-day free trial • Cancel anytime
						</div>
					</div>
				</section>
			</main>

			<footer className="bg-gray-900 border-t border-gray-800">
				<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1">
						<div className="relative w-full flex justify-center">
							<div className="glassy-3d">
								<span>G</span>
								<span>I</span>
								<span>G</span>
								<span>G</span>
								<span>U</span>
								<span>A</span>
								<span>R</span>
								<span>D</span>
							</div>
						</div>
					</div>

					<div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
						<p className="text-gray-500">
							© 2024 GigGuard. All rights reserved.
						</p>
						<div className="flex space-x-4">
							<a
								href="https://x.com/gigguard"
								className="text-gray-400 hover:text-[#ff4800]"
							>
								<span className="sr-only">Twitter</span>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
							</a>
							<a
								href="https://www.linkedin.com/company/gigguard"
								className="text-gray-400 hover:text-[#ff6000]"
							>
								<span className="sr-only">LinkedIn</span>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
							<a
								href="https://www.instagram.com/gigguard"
								className="text-gray-400 hover:text-[#ff6000]"
							>
								<span className="sr-only">Instagram</span>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
						</div>
						<div className="mt-4 md:mt-0">
							<Button
								variant="link"
								className="text-gray-400 hover:text-[#ff6000] p-0 h-auto"
							>
								Privacy Policy
							</Button>
							<span className="text-gray-600 mx-2">•</span>
							<Button
								variant="link"
								className="text-gray-400 hover:text-[#ff6000] p-0 h-auto"
							>
								Terms of Service
							</Button>
							<span className="text-gray-600 mx-2">•</span>
							<Button
								variant="link"
								className="text-gray-400 hover:text-[#ff6000] p-0 h-auto"
							>
								Cookies
							</Button>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
