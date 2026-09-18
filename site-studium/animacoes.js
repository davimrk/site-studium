gsap.registerPlugin(ScrollTrigger);


gsap.from(".logo-hero", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  ease: "back.inOut(1.7)",
});

gsap.from(".subtitulo, .hero-texto .btn1", {
  opacity: 0,
  y: 20,
  duration: 0.6,
  delay: 0.3,
  stagger: 0.15,
});

gsap.from(".corvo", {
  opacity: 0,
  scale: 0.8,
  duration: 1,
  delay: 0.3,
  ease: "elastic.out(1, 0.6)",
});


gsap.from(".ia-card", {
  scrollTrigger: {
    trigger: ".ia-card",
    start: "top 85%",
  },
  opacity: 0,
  y: 40,
  duration: 1,
});

gsap.from(".card-lista li", {
  scrollTrigger: {
    trigger: ".card-lista",
    start: "top 85%",
  },
  opacity: 0,
  x: -20,
  duration: 0.5,
  stagger: 0.1,
});

