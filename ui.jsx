
const { useState, useEffect, useMemo, useRef } = React;

function number(v, d=4){ return Number(v).toFixed(d); }

function Header(){
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-teal-400"></div>
        <div>
          <div className="text-sm opacity-70 uppercase tracking-widest">Ow1 Studies & Researches</div>
          <div className="text-xl brand-gradient font-semibold -mt-1">Options Lab</div>
        </div>
      </div>
      <div className="text-xs opacity-70">Educational demo • No financial advice</div>
    </div>
  );
}

function Metric({label, value, sub}){
  return (
    <div className="p-3 glass rounded-xl">
      <div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  )
}

function ChainTable({rows}){
  return (
    <div className="overflow-auto h-[320px]">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-neutral-900">
          <tr className="text-left">
            <th className="p-2">Strike</th>
            <th className="p-2">Call</th>
            <th className="p-2">Put</th>
            <th className="p-2">IV (C)</th>
            <th className="p-2">IV (P)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=> (
            <tr key={i} className="odd:bg-neutral-900/40 hover:bg-neutral-800/40">
              <td className="p-2">{r.strike}</td>
              <td className="p-2">{r.call}</td>
              <td className="p-2">{r.put}</td>
              <td className="p-2">{r.iv_call}</td>
              <td className="p-2">{r.iv_put}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PriceForm({onResult}){
  const [S,setS]=useState(100),[K,setK]=useState(100),[r,setR]=useState(0.02),[q,setQ]=useState(0.0),
        [sigma,setSigma]=useState(0.3),[T,setT]=useState(30),[type_,setType]=useState("call"),
        [model,setModel]=useState("bs_euro"),[steps,setSteps]=useState(200);
  const submit = async(e)=>{
    e.preventDefault();
    const body = { S:Number(S),K:Number(K),r:Number(r),q:Number(q),sigma:Number(sigma),T:Number(T)/365.0,type:type_,model,steps:Number(steps)};
    const res = await fetch("/api/price",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
    const data = await res.json();
    onResult({inputs:body, result:data});
  };
  return (
    <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {([["Spot S",S,setS],["Strike K",K,setK],["Rate r",r,setR],["Dividend q",q,setQ],["Sigma",sigma,setSigma],["Days to Exp",T,setT]].map(([l,v,s])=>(
        <div key={l} className="glass rounded-xl p-3">
          <div className="text-[10px] uppercase opacity-60">{l}</div>
          <input className="w-full bg-transparent outline-none text-lg" value={v} onChange={e=>s(e.target.value)}/>
        </div>
      )))}
      <div className="glass rounded-xl p-3">
        <div className="text-[10px] uppercase opacity-60">Type</div>
        <select className="w-full bg-transparent outline-none" value={type_} onChange={e=>setType(e.target.value)}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </div>
      <div className="glass rounded-xl p-3">
        <div className="text-[10px] uppercase opacity-60">Model</div>
        <select className="w-full bg-transparent outline-none" value={model} onChange={e=>setModel(e.target.value)}>
          <option value="bs_euro">Black–Scholes (Euro)</option>
          <option value="binom_euro">Binomial (Euro)</option>
          <option value="binom_amer">Binomial (American)</option>
        </select>
      </div>
      <div className="glass rounded-xl p-3">
        <div className="text-[10px] uppercase opacity-60">Binomial Steps</div>
        <input className="w-full bg-transparent outline-none" value={steps} onChange={e=>setSteps(e.target.value)}/>
      </div>
      <button className="col-span-2 md:col-span-4 bg-white text-neutral-900 rounded-xl py-3 font-semibold hover:opacity-90 transition">Price Option</button>
    </form>
  )
}

function ChartPanel({rows}){
  const canvasRef = useRef();
  useEffect(()=>{
    const ctx = canvasRef.current.getContext('2d');
    const strikes = rows.map(r=>r.strike);
    const calls = rows.map(r=>r.call);
    const puts = rows.map(r=>r.put);
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: strikes,
        datasets: [
          { label: 'Call Price', data: calls, tension: 0.25 },
          { label: 'Put Price', data: puts, tension: 0.25 }
        ]
      },
      options: { responsive:true, plugins:{legend:{labels:{color:'#e5e7eb'}}}, scales:{x:{ticks:{color:'#9ca3af'}}, y:{ticks:{color:'#9ca3af'}}} }
    });
    return ()=>chart.destroy();
  }, [JSON.stringify(rows)]);
  return <canvas ref={canvasRef} height="140"></canvas>
}

function App(){
  const [chain,setChain]=useState({chain:[]});
  const [last,setLast]=useState(null);
  const fetchChain = async(params={})=>{
    const q = new URLSearchParams(params).toString();
    const res = await fetch("/api/mock_chain?" + q);
    const data = await res.json();
    setChain(data);
  };
  useEffect(()=>{ fetchChain({S:100,r:0.02,q:0.0,sigma:0.3,T_days:30}); },[]);

  return (
    <div className="max-w-7xl mx-auto">
      <Header/>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        <div className="lg:col-span-8 space-y-4">
          <div className="glass card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm uppercase tracking-widest opacity-60">Option Chain</div>
              <button onClick={()=>fetchChain({S:chain.S, r:chain.r, q:chain.q, sigma:chain.sigma, T_days:chain.T_days})}
                className="text-xs glass rounded-lg px-3 py-1">Refresh</button>
            </div>
            <ChainTable rows={chain.chain}/>
          </div>
          <div className="glass card p-4">
            <div className="text-sm uppercase tracking-widest opacity-60 mb-2">Price vs Strike</div>
            <ChartPanel rows={chain.chain}/>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="glass card p-4">
            <div className="text-sm uppercase tracking-widest opacity-60 mb-2">Calculator</div>
            <PriceForm onResult={setLast}/>
          </div>
          {last && (
            <div className="glass card p-4">
              <div className="text-sm uppercase tracking-widest opacity-60 mb-2">Result</div>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Price" value={number(last.result.price,4)} sub="Model output"/>
                <Metric label="Delta" value={number(last.result.greeks.delta,4)}/>
                <Metric label="Gamma" value={number(last.result.greeks.gamma,6)}/>
                <Metric label="Vega" value={number(last.result.greeks.vega,4)}/>
                <Metric label="Theta" value={number(last.result.greeks.theta,4)}/>
                <Metric label="Rho" value={number(last.result.greeks.rho,4)}/>
              </div>
            </div>
          )}
          <div className="text-xs opacity-60 text-center">© Ow1 Studies & Researches</div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
