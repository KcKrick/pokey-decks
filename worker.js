// PoKey Scan API — deploy as a Cloudflare Worker.
// Secrets: OPENAI_API_KEY. Variable: ALLOWED_ORIGIN (your exact GitHub Pages origin).
const headers=(origin,allowed)=>({'Content-Type':'application/json','Access-Control-Allow-Origin':origin===allowed?origin:'null','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
const fail=(status,message,h)=>new Response(JSON.stringify({error:message}),{status,headers:h});
async function openai(path,key,payload){const r=await fetch('https://api.openai.com/v1/'+path,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error('Recognition provider unavailable ('+r.status+')');return r.json()}
export default {async fetch(req,env){
const origin=req.headers.get('Origin')||'',allowed=env.ALLOWED_ORIGIN||'https://kckrick.github.io',h=headers(origin,allowed);
if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...h,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
if(req.method!=='POST'||new URL(req.url).pathname!=='/scan')return fail(404,'Not found',h);
if(origin!==allowed)return fail(403,'Origin not allowed',h);
if(!env.OPENAI_API_KEY)return fail(503,'Recognition service is not configured',h);
const length=Number(req.headers.get('Content-Length')||0);if(length>9_000_000)return fail(413,'Image too large',h);
let data;try{data=await req.json()}catch{return fail(400,'Invalid request',h)}
const mime=data?.mime,base64=data?.image;
if(!['image/jpeg','image/png','image/webp'].includes(mime)||typeof base64!=='string'||base64.length>8_000_000||!(/^[A-Za-z0-9+/]*={0,2}$/.test(base64)))return fail(400,'Please upload a supported card image under 6 MB',h);
const url='data:'+mime+';base64,'+base64;
try{
const mod=await openai('moderations',env.OPENAI_API_KEY,{model:'omni-moderation-latest',input:[{type:'image_url',image_url:{url}}]});
if(mod.results?.[0]?.flagged)return fail(422,'This image cannot be processed. Please upload a card-only screenshot.',h);
// Moderation is one layer, not a guarantee; the visual classifier also rejects non-card photos.
const result=await openai('chat/completions',env.OPENAI_API_KEY,{model:'gpt-4.1-mini',temperature:0,max_tokens:2200,response_format:{type:'json_object'},messages:[{role:'system',content:'You analyze Pokémon TCG deck screenshots only. Return strictly JSON with keys accepted (boolean), reason (short string), cards (array). Reject photos without a clearly visible Pokemon TCG decklist, or images with people, body parts, intimate content, or unrelated personal scenes. For accepted decklists, identify each unique card entry, printed card name, quantity badge, and any visually legible set code and collector number. Each card entry must have name (string), quantity (integer 1-60), setCode (string or null), number (string or null), confidence (number 0-1). Never invent identifiers or quantities; if any field is unclear use null and confidence below 0.7. Do not infer from deck archetype. Do not claim any export is tournament-ready.'},{role:'user',content:[{type:'text',text:'Inspect this uploaded Pokémon TCG decklist screenshot. Reject unrelated images. Extract card entries and quantities precisely. If the quantity is uncertain set quantity to null.'},{type:'image_url',image_url:{url,detail:'high'}}]}]});
const parsed=JSON.parse(result.choices?.[0]?.message?.content||'{}');
if(parsed.accepted!==true)return fail(422,'No suitable card-only decklist was found. Please upload a clear deck screenshot.',h);
if(!Array.isArray(parsed.cards)||parsed.cards.length<1||parsed.cards.length>100)return fail(422,'Could not identify a reliable decklist',h);
const cards=parsed.cards.map(c=>({name:typeof c.name==='string'?c.name.slice(0,120):'',quantity:Number.isInteger(c.quantity)&&c.quantity>=1&&c.quantity<=60?c.quantity:null,setCode:typeof c.setCode==='string'?c.setCode.slice(0,20):null,number:typeof c.number==='string'?c.number.slice(0,20):null,confidence:Math.min(1,Math.max(0,Number(c.confidence)||0))}));
return new Response(JSON.stringify({cards,needsReview:true,total:cards.reduce((n,c)=>n+(c.quantity||0),0),warning:'AI results are unverified. Confirm each card and printing against the original image.'}),{headers:h});
}catch{return fail(502,'Image processing failed. Please try again later.',h)}
}}};
