// Run: npx tsx scripts/demo-guard-check.ts. Checks that demo mode can only turn on for the separate demo project.
import { isDemoMode, isRealHost } from "../lib/demo-mode";
let fails=0; const t=(n:string,c:boolean)=>{console.log((c?"PASS ":"FAIL ")+n); if(!c) fails++;};
const demoProd={VERCEL_ENV:"production",KAMILI_DEMO_MODE:"1",KAMILI_DEMO_PROJECT:"kamili-demo",KAMILI_DEMO_HOST:"demo.kamilihq.com",VERCEL_PROJECT_PRODUCTION_URL:"demo.kamilihq.com"};
t("demo project production: on", isDemoMode(demoProd));
t("real site production, nothing set: off", !isDemoMode({VERCEL_ENV:"production",VERCEL_PROJECT_PRODUCTION_URL:"legacylinehq.com"}));
t("real site production even with flag + demo/ branch: off", !isDemoMode({VERCEL_ENV:"production",KAMILI_DEMO_MODE:"1",VERCEL_GIT_COMMIT_REF:"demo/x",VERCEL_PROJECT_PRODUCTION_URL:"legacylinehq.com"}));
t("all demo vars but real production URL: off", !isDemoMode({...demoProd,VERCEL_PROJECT_PRODUCTION_URL:"www.kamilihq.com"}));
t("wrong host: off", !isDemoMode({...demoProd,KAMILI_DEMO_HOST:"kamilihq.com"}));
t("wrong project: off", !isDemoMode({...demoProd,KAMILI_DEMO_PROJECT:"legacyline-web"}));
t("flag missing: off", !isDemoMode({...demoProd,KAMILI_DEMO_MODE:undefined}));
t("preview demo/ branch: on", isDemoMode({VERCEL_ENV:"preview",VERCEL_GIT_COMMIT_REF:"demo/kamili-standing-demo"}));
t("preview main: off", !isDemoMode({VERCEL_ENV:"preview",VERCEL_GIT_COMMIT_REF:"main"}));
t("local flag: on", isDemoMode({KAMILI_DEMO_MODE:"1"}));
t("local nothing: off", !isDemoMode({}));
t("real hosts", ["legacylinehq.com","www.legacylinehq.com","KAMILIHQ.com:443","https://www.kamilihq.com/x"].every(isRealHost));
t("demo host not real", !isRealHost("demo.kamilihq.com"));
console.log(fails? `${fails} FAILED`:"all passed"); process.exit(fails?1:0);
