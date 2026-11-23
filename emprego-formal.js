(() => {
  const dataUrl = "data/emprego-formal.json";
  const fmt = new Intl.NumberFormat("pt-BR");
  const $ = id => document.getElementById(id);
  const controls = ["period-start","period-end","indicator-select","reset-filters","download-csv"];
  let rows = [];
  let chart = null;
  const labels = {balance:"Saldo de empregos",admissions:"Admissões",dismissals:"Desligamentos",stock:"Estoque"};
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
    $("kpi-stock").textContent = list.length ? display(list[list.length-1].stock) : "—";
    $("data-table").innerHTML = list.length ? list.map(r => `<tr><td>${monthLabel(r.period)}</td><td>${display(r.admissions)}</td><td>${display(r.dismissals)}</td><td>${display(r.balance)}</td><td>${display(r.stock)}</td></tr>`).join("") : '<tr><td colspan="5" class="empty-cell">Nenhum registro para os filtros selecionados.</td></tr>';
    if(chart) {
      chart.data.datasets[0].label = labels[metric];
      chart.data.datasets[0].data = list.map(r=>validNumber(r[metric]) ? Number(r[metric]) : null);
      chart.data.labels = list.map(r=>monthLabel(r.period));
      chart.update();
    }
  };
  const download = () => {
    const head = ["period","admissions","dismissals","balance","stock"];
    const csv = [head.join(";"),...filtered().map(r=>head.map(k=>r[k]??"").join(";"))].join("\n");
    const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download="novo-caged-contagem.csv";a.click();URL.revokeObjectURL(url);
  };
  fetch(dataUrl).then(r=>{if(!r.ok) throw new Error("base indisponível");return r.json();}).then(payload=>{
    rows = Array.isArray(payload.data) ? payload.data.filter(r=>/^\d{4}-\d{2}$/.test(r.period) && ["admissions","dismissals","balance"].every(k=>validNumber(r[k])) && (r.stock === null || r.stock === undefined || validNumber(r.stock))).sort((a,b)=>a.period.localeCompare(b.period)) : [];
    if(!rows.length) throw new Error("base sem observações validadas");
    const periods = [...new Set(rows.map(r=>r.period))];
    $("period-start").innerHTML = periods.map(p=>`<option value="${p}">${monthLabel(p)}</option>`).join("");
    $("period-end").innerHTML = periods.map(p=>`<option value="${p}">${monthLabel(p)}</option>`).join("");
    $("period-start").value=periods[0];$("period-end").value=periods[periods.length-1];
    controls.forEach(id=>$(id).disabled=false);
    $("data-status").textContent = "Base carregada · " + (payload.reference || "período informado na fonte");
    $("chart-empty").hidden=true;
    if(window.Chart){
      chart = new Chart($("employment-chart"),{type:"line",data:{labels:rows.map(r=>monthLabel(r.period)),datasets:[{label:"Saldo de empregos",data:rows.map(r=>r.balance),borderColor:"#176b9b",backgroundColor:"rgba(23,107,155,.12)",fill:true,tension:.28,pointRadius:2,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:"#edf1f3"},ticks:{callback:v=>fmt.format(v)}},x:{grid:{display:false}}}}});
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