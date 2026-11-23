(() => {
  const dataUrl = "data/emprego-formal.json";
  const fmt = new Intl.NumberFormat("pt-BR");
  const $ = id => document.getElementById(id);
  const controls = ["period-start","period-end","indicator-select","reset-filters","download-csv"];
  let rows = [];
  let chart = null;
  const labels = {balance:"Saldo de empregos",admissions:"Admissões",dismissals:"Desligamentos",stock:"Estoque",relative_variation:"Variação relativa"};
  const validNumber = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  const display = value => validNumber(value) ? fmt.format(Number(value)) : "—";
  const monthLabel = value => {
    const d = new Date(value + "T12:00:00");
    return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("pt-BR",{month:"short",year:"numeric"}).format(d);
  };
  const filtered = () => {
    const start = $("period-start").value, end = $("period-end").value;
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
      chart.update();
    }
  };
  const download = () => {
    const head = ["period","admissions","dismissals","balance","stock","relative_variation"];
    const csv = [head.join(";"),...filtered().map(r=>head.map(k=>r[k]??"").join(";"))].join("\n");
    const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download="novo-caged-contagem.csv";a.click();URL.revokeObjectURL(url);
  };
  fetch(dataUrl).then(r=>{if(!r.ok) throw new Error("base indisponível");return r.json();}).then(payload=>{
    rows = Array.isArray(payload.data) ? payload.data.filter(r=>/^\d{4}-\d{2}$/.test(r.period) && ["admissions","dismissals","balance"].every(k=>validNumber(r[k])) && (r.stock === null || r.stock === undefined || validNumber(r.stock)) && (r.relative_variation === null || r.relative_variation === undefined || validNumber(r.relative_variation))).sort((a,b)=>a.period.localeCompare(b.period)) : [];
    if(!rows.length) throw new Error("base sem observações validadas");
    const periods = [...new Set(rows.map(r=>r.period))];
    $("period-start").innerHTML = periods.map(p=>`<option value="${p}">${monthLabel(p)}</option>`).join("");
    $("period-end").innerHTML = periods.map(p=>`<option value="${p}">${monthLabel(p)}</option>`).join("");
    $("period-start").value=periods[0];$("period-end").value=periods[periods.length-1];
    controls.forEach(id=>$(id).disabled=false);
    $("data-status").textContent = "Base carregada · " + (payload.reference || "período informado na fonte");
    const sectors = Array.isArray(payload.sectors) ? payload.sectors : [];
    const sectorTotals = sectors.reduce((acc,s)=>({admissions:acc.admissions+Number(s.admissions||0),dismissals:acc.dismissals+Number(s.dismissals||0),balance:acc.balance+Number(s.balance||0)}),{admissions:0,dismissals:0,balance:0});
    const sectorValid = sectors.length>0 && sectors.every(s=>s.sector && ["admissions","dismissals","balance"].every(k=>validNumber(s[k]) && Number(s[k])===Math.trunc(Number(s[k])))) && sectorTotals.admissions===14778 && sectorTotals.dismissals===11872 && sectorTotals.balance===2906;
    $("sector-table").innerHTML = sectorValid ? sectors.map(s=>"<tr><td>"+s.sector+"</td><td>"+display(s.admissions)+"</td><td>"+display(s.dismissals)+"</td><td class='"+(Number(s.balance)<0?"negative-balance":"positive-balance")+"'>"+(Number(s.balance)>0?"+":"")+display(s.balance)+"</td></tr>").join("") : '<tr><td colspan="4" class="empty-cell">Dados setoriais indisponíveis ou divergentes dos totais municipais.</td></tr>';

    if(window.Chart){
      $("chart-empty").hidden=true;
      chart = new Chart($("employment-chart"),{type:"line",data:{labels:rows.map(r=>monthLabel(r.period)),datasets:[{label:"Saldo de empregos",data:rows.map(r=>r.balance),borderColor:"#176b9b",backgroundColor:"rgba(23,107,155,.12)",fill:true,tension:.28,pointRadius:2,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:"#edf1f3"},ticks:{callback:v=>fmt.format(v)}},x:{grid:{display:false}}}}});
    } else {
      $("chart-empty").hidden=false;
      $("chart-empty").innerHTML = "<strong>O gráfico não pôde ser carregado.</strong><span>Os indicadores e a tabela continuam disponíveis; tente recarregar a página para carregar a biblioteca do gráfico.</span>";
    }
    ["period-start","period-end","indicator-select"].forEach(id=>$(id).addEventListener("change",show));
    $("reset-filters").addEventListener("click",()=>{$("period-start").value=periods[0];$("period-end").value=periods[periods.length-1];$("indicator-select").value="balance";show();});
    $("download-csv").addEventListener("click",download);
    show();
  }).catch(()=>{
    $("data-status").textContent = "Integração de dados em preparação";
    $("chart-empty").hidden=false;
  });
})();