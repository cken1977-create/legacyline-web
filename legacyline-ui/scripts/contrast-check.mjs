// WCAG 2.x contrast check for every text/background pair the Assay Office uses.
// Run: node scripts/contrast-check.mjs  (exits 1 on any AA failure)
const T = { paper:"#F7F3EA", card:"#FFFDF8", vellum:"#EFE8DA", ink:"#15202B", ink2:"#3D4A57", ink3:"#5E6975", action:"#1D4F91", actionHover:"#173F75", sealText:"#7C5A12", seal:"#C8A84B", engine:"#0B6E78", amber:"#8F5300", brick:"#A3352B", pine:"#2E6A46",
  engineTint:"#DDF0F1", amberTint:"#FBEBD0", brickTint:"#F6DEDA", pineTint:"#DFEEE3", actionTint:"#DCE6F4", sealTint:"#F3E8C9",
  night:"#0E0F11", panel:"#16181C", cream:"#F4EFE6", creamDim:"#B9B1A3", slate:"#8E959E", gold:"#C8A84B", goldBright:"#DDBF6A", engineN:"#4CC3CF", blueN:"#7FA8E6", pineN:"#62B487" };
const lum = (h) => { const c = [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255).map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
// [fg, bg, where, min] — min 4.5 for text, 3 for large text / non-text UI
const P = [
  ["ink","paper","body on paper",4.5],["ink","card","body on card",4.5],["ink2","paper","secondary on paper",4.5],["ink2","card","secondary on card",4.5],["ink2","vellum","secondary on vellum (nav, wells)",4.5],
  ["ink3","paper","meta on paper",4.5],["ink3","card","meta on card",4.5],["ink3","vellum","meta / disabled button on vellum",4.5],
  ["action","paper","links on paper",4.5],["action","card","links on card",4.5],["paper","action","primary button text",4.5],["paper","actionHover","primary button hover",4.5],
  ["sealText","card","seal-outline button",4.5],["ink","seal","certified chip / seal disc",4.5],["engine","card","Verify / engine text on card",4.5],["engine","paper","engine text on paper",4.5],
  ["amber","card","needs-attention text",4.5],["brick","card","error glyph",4.5],["pine","card","passed / verified",4.5],["pine","paper","passed on paper",4.5],["paper","pine","Ready chip",4.5],
  ["ink","engineTint","chip on engine tint",4.5],["ink","amberTint","chip on amber tint",4.5],["ink","brickTint","error message",4.5],["ink","pineTint","chip on pine tint",4.5],["ink","actionTint","chip on action tint",4.5],["ink","sealTint","demo banner",4.5],["ink2","vellum","pre-readiness chip",4.5],
  ["cream","night","site body",4.5],["creamDim","night","site secondary",4.5],["creamDim","panel","site secondary on panel",4.5],["slate","night","site meta",4.5],["slate","panel","site meta on panel",4.5],["gold","night","site eyebrow",4.5],["night","gold","gold CTA text",4.5],["night","goldBright","gold CTA hover",4.5],["engineN","night","site Verify",4.5],["blueN","night","site links",4.5],["ink3","cream","receipt meta on cream",4.5],["pine","cream","receipt passed on cream",4.5],["ink2","vellum","receipt footer",4.5],["engine","vellum","receipt reproduced",4.5],
  ["action","card","focus ring / input focus (non-text)",3],
];
let fail = 0;
for (const [f,b,w,min] of P) { const r = ratio(T[f],T[b]); const ok = r >= min; if (!ok) fail++; console.log(`${ok?"PASS":"FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${f} on ${b} — ${w}`); }
console.log(`\n${P.length - fail}/${P.length} pairs pass WCAG AA`);
process.exit(fail ? 1 : 0);
