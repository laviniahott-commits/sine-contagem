(() => {
  const dataUrl = "data/emprego-formal.json";
  const fmt = new Intl.NumberFormat("pt-BR");
  const fmtPercent = new Intl.NumberFormat("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  const $ = id => document.getElementById(id);
  const controls = ["period-start","period-end","indicator-select","reset-filters","download-csv"];
  let rows = [];
  let chart = null;
  let annualBalanceChart = null;
  let annualMovementChart = null;
  const labels = {balance:"Saldo de empregos",admissions:"Admissões",dismissals:"Desligamentos",stock:"Estoque",relative_variation:"Variação relativa (%)"};
  const validNumber = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  const display = value => validNumber(value) ? fmt.format(Number(value)) : "—";
  const monthLabel = value => {
    const d = new Date(value + "T12:00:00");
    return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("pt-BR",{month:"short",year:"numeric"}).format(d);
  };
  const filtered = () => {
    let start = $("period-start").value, end = $("period-end").value;
    if (start && end && start > end) [start, end] = [end, start];
    return rows.filter(r => (!start || r.period >= start) && (!end || r.period <= end));
  };
  const sum = (list,key) => {
    const values = list.map(r=>r[key]).filter(validNumber);
    return values.length ? values.reduce((a,v)=>a+Number(v),0) : null;
  };
  const show = () => {
    const list = filtered();
    const metric = $("indicator-select").value;
    $("chart-title").textContent = "Evolução: " + labels[metric];
    $("kpi-admissions").textContent = display(sum(list,"admissions"));
    $("kpi-dismissals").textContent = display(sum(list,"dismissals"));
    $("kpi-balance").textContent = display(sum(list,"balance"));
    const latestStock = [...list].reverse().find(r => validNumber(r.stock));
    $("kpi-stock").textContent = latestStock ? display(latestStock.stock) : "—";
    const latestRelative = [...list].reverse().find(r => validNumber(r.relative_variation));
    $("kpi-relative").textContent = latestRelative ? Number(latestRelative.relative_variation).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}) + "%" : "—";
    $("data-table").innerHTML = list.length ? list.map(r => `<tr><td>${monthLabel(r.period)}</td><td>${display(r.admissions)}</td><td>${display(r.dismissals)}</td><td>${display(r.balance)}</td><td>${display(r.stock)}</td><td>${validNumber(r.relative_variation) ? Number(r.relative_variation).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}) + "%" : "—"}</td></tr>`).join("") : '<tr><td colspan="6" class="empty-cell">Nenhum registro para os filtros selecionados.</td></tr>';
    if(chart) {
      chart.data.datasets[0].label = labels[metric];
      chart.data.datasets[0].data = list.map(r=>validNumber(r[metric]) ? Number(r[metric]) : null);
      chart.data.labels = list.map(r=>monthLabel(r.period));
      chart.options.scales.y.ticks.callback = value => metric === "relative_variation" ? fmtPercent.format(value) + "%" : fmt.format(value);
      chart.update();
    }
  };
  const download = () => {
    const head = ["period","admissions","dismissals","balance","stock","relative_variation"];
    const escapeCsv = value => {
      const text = value === null || value === undefined ? "" : String(value);
      return /[;"\n\r]/.test(text) ? '"' + text.replace(/"/g,'""') + '"' : text;
    };
    const csv = [head.join(";"),...filtered().map(r=>head.map(k=>escapeCsv(r[k])).join(";"))].join("\r\n");
    const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download="novo-caged-contagem.csv";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  fetch(dataUrl).then(r=>{if(!r.ok) throw new Error("base indisponível");return r.json();}).then(payload=>{
    rows = Array.isArray(payload.data) ? payload.data.filter(r=>/^\d{4}-\d{2}$/.test(r.period) && ["admissions","dismissals","balance"].every(k=>validNumber(r[k])) && (r.stock === null || r.stock === undefined || validNumber(r.stock)) && (r.relative_variation === null || r.relative_variation === undefined || validNumber(r.relative_variation))).sort((a,b)=>a.period.localeCompare(b.period)) : [];
    if(!rows.length) throw new Error("base sem observações validadas");
    const periods = [...new Set(rows.map(r=>r.period))];
    $("period-start").innerHTML = periods.map(p=>`<option value="${p}">${monthLabel(p)}</option>`).join("");
    $("period-end").innerHTML = periods.map(p=>`<option value="${p}">${monthLabel(p)}</option>`).join("");
    $("period-start").value=periods[0];$("period-end").value=periods[periods.length-1];
    controls.forEach(id=>$(id).disabled=false);
    $("data-status").textContent = "Dados carregados · validação oficial pendente · " + (payload.reference || "período informado na fonte");
    const annual = Array.isArray(payload.annual_summary) ? payload.annual_summary : [];
    const annualValid = annual.length===5 && annual.every((r,i)=>Number.isInteger(r.year) && r.year===2021+i && ["admissions","dismissals","balance","stock","relative_variation"].every(k=>validNumber(r[k])) && Number(r.admissions)-Number(r.dismissals)===Number(r.balance));
    $("annual-table").innerHTML = annualValid ? annual.map(r=>"<tr><td>"+r.year+"</td><td>"+display(r.admissions)+"</td><td>"+display(r.dismissals)+"</td><td class='"+(Number(r.balance)<0?"negative-balance":"positive-balance")+"'>"+(Number(r.balance)>0?"+":"")+display(r.balance)+"</td><td>"+display(r.stock)+"</td><td>"+Number(r.relative_variation).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%</td></tr>").join("") : '<tr><td colspan="6" class="empty-cell">Série anual indisponível ou com inconsistências nos valores informados.</td></tr>';

    if(window.Chart && annualValid){
      $("annual-balance-empty").hidden=true;
      $("annual-movement-empty").hidden=true;
      const years=annual.map(r=>String(r.year));
      annualBalanceChart=new Chart($("annual-balance-chart"),{type:"bar",data:{labels:years,datasets:[{label:"Saldo de empregos",data:annual.map(r=>Number(r.balance)),backgroundColor:"#176b9b",borderRadius:3,maxBarThickness:48}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>"Saldo: "+fmt.format(ctx.parsed.y)+" vínculos"}}},scales:{y:{beginAtZero:true,grid:{color:"#edf1f3"},ticks:{callback:v=>fmt.format(v)}},x:{grid:{display:false}}}}});
      annualMovementChart=new Chart($("annual-movement-chart"),{type:"bar",data:{labels:years,datasets:[{label:"Admissões",data:annual.map(r=>Number(r.admissions)),backgroundColor:"#176b9b",borderRadius:3},{label:"Desligamentos",data:annual.map(r=>Number(r.dismissals)),backgroundColor:"#f2b544",borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8}},tooltip:{callbacks:{label:ctx=>ctx.dataset.label+": "+fmt.format(ctx.parsed.y)+" vínculos"}}},scales:{y:{beginAtZero:true,grid:{color:"#edf1f3"},ticks:{callback:v=>fmt.format(v)}},x:{grid:{display:false}}}}});
    } else {
      $("annual-balance-empty").hidden=false;
      $("annual-movement-empty").hidden=false;
      const message=window.Chart?"Série anual indisponível ou inconsistente.":"Biblioteca de gráficos indisponível. A tabela anual permanece disponível.";
      $("annual-balance-empty").innerHTML="<strong>"+message+"</strong>";
      $("annual-movement-empty").innerHTML="<strong>"+message+"</strong>";
    }


    const sectors = Array.isArray(payload.sectors) ? payload.sectors : [];
    const sectorTotals = sectors.reduce((acc,s)=>({admissions:acc.admissions+Number(s.admissions||0),dismissals:acc.dismissals+Number(s.dismissals||0),balance:acc.balance+Number(s.balance||0)}),{admissions:0,dismissals:0,balance:0});
    const latestMonth = rows[rows.length-1];
    if(latestMonth){
      const sign = Number(latestMonth.balance)>0 ? "+" : "";
      $("latest-month-summary").innerHTML = "<strong>"+monthLabel(latestMonth.period)+":</strong> saldo de <strong>"+sign+display(latestMonth.balance)+"</strong> vínculos, com "+display(latestMonth.admissions)+" admissões e "+display(latestMonth.dismissals)+" desligamentos. Este resultado mensal não integra os gráficos anuais de 2021 a 2025.";
    }
    const sectorReference = latestMonth;
    const sectorValid = sectors.length>0 && !!sectorReference &&
      sectors.every(s=>s.sector && ["admissions","dismissals","balance"].every(k=>validNumber(s[k]) && Number(s[k])===Math.trunc(Number(s[k])) && Number(s[k])>=-Number.MAX_SAFE_INTEGER)) &&
      sectorTotals.admissions===Number(sectorReference.admissions) &&
      sectorTotals.dismissals===Number(sectorReference.dismissals) &&
      sectorTotals.balance===Number(sectorReference.balance);
    $("sector-table").innerHTML = sectorValid ? sectors.map(s=>"<tr><td>"+s.sector+"</td><td>"+display(s.admissions)+"</td><td>"+display(s.dismissals)+"</td><td class='"+(Number(s.balance)<0?"negative-balance":"positive-balance")+"'>"+(Number(s.balance)>0?"+":"")+display(s.balance)+"</td></tr>").join("") : '<tr><td colspan="4" class="empty-cell">Dados setoriais indisponíveis ou divergentes dos totais municipais.</td></tr>';

    if(window.Chart && rows.length >= 2){
      $("chart-empty").hidden=true;
      chart = new Chart($("employment-chart"),{type:"line",data:{labels:rows.map(r=>monthLabel(r.period)),datasets:[{label:"Saldo de empregos",data:rows.map(r=>r.balance),borderColor:"#176b9b",backgroundColor:"rgba(23,107,155,.12)",fill:true,tension:.28,pointRadius:2,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.dataset.label+": "+(ctx.dataset.label.includes("(%)")?fmtPercent.format(ctx.parsed.y)+"%":fmt.format(ctx.parsed.y)+" vínculos")}}},scales:{y:{grid:{color:"#edf1f3"},ticks:{callback:v=>fmt.format(v)}},x:{grid:{display:false}}}}});
    } else {
      $("chart-empty").hidden=false;
      $("chart-empty").innerHTML = !window.Chart
        ? "<strong>O gráfico não pôde ser carregado.</strong><span>Os indicadores e a tabela continuam disponíveis; tente recarregar a página para carregar a biblioteca do gráfico.</span>"
        : "<strong>Série mensal ainda insuficiente para mostrar uma evolução.</strong><span>Há apenas uma competência mensal carregada. Os indicadores e a tabela exibem esse resultado; o gráfico será ativado quando houver pelo menos dois meses de dados.</span>";
    }
    ["period-start","period-end","indicator-select"].forEach(id=>$(id).addEventListener("change",show));
    $("reset-filters").addEventListener("click",()=>{$("period-start").value=periods[0];$("period-end").value=periods[periods.length-1];$("indicator-select").value="balance";show();});
    $("download-csv").addEventListener("click",download);
    show();
  }).catch(()=>{
    $("data-status").textContent = "Não foi possível carregar a base de dados.";
    $("chart-empty").hidden=false;
    $("chart-empty").innerHTML = "<strong>Não foi possível carregar os dados deste painel.</strong><span>Confira sua conexão e atualize a página. Se o problema continuar, a base de dados pode estar temporariamente indisponível.</span>";
    $("data-table").innerHTML = '<tr><td colspan="6" class="empty-cell">Dados indisponíveis no momento.</td></tr>';
    $("annual-table").innerHTML = '<tr><td colspan="6" class="empty-cell">Dados anuais indisponíveis no momento.</td></tr>';
    $("sector-table").innerHTML = '<tr><td colspan="4" class="empty-cell">Dados setoriais indisponíveis no momento.</td></tr>';
    $("annual-balance-empty").hidden=false;
    $("annual-movement-empty").hidden=false;
    $("annual-balance-empty").textContent = "Gráfico anual indisponível porque a base de dados não foi carregada.";
    $("annual-movement-empty").textContent = "Gráfico anual indisponível porque a base de dados não foi carregada.";
    $("latest-month-summary").textContent = "O resultado mensal mais recente não pôde ser carregado.";
  });
})();