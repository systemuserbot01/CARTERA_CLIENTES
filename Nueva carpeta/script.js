
"use strict";
const $=id=>document.getElementById(id);
const ICONO_USER=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>`;
const ICONO_FACTURA=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>`;
const ICONO_ABONO=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>`;
const ICONO_FLECHA=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const ICONO_SUBIR=`<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></svg>`;
const ICONO_PDF=`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>`;
const ICONO_IMAGEN=`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;
const ICONO_BASURA=`<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/></svg>`;
const ICONO_LAPIZ=`<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20Z"/></svg>`;
const ICONO_CHECK=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>`;
const ICONO_X=`<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
const ICONO_CLIP=`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>`;
const BANCOS={Guayaquil:{dominio:"bancoguayaquil.com",inicial:"G"},Pichincha:{dominio:"pichincha.com",inicial:"P"},Machala:{dominio:"bancomachala.com",inicial:"M"}};
const KEY="control_clientes_minimal_v1";
const VIEW_KEY="mi_cartera_vista_clientes";
const MAX_ARCHIVO=1.5*1024*1024;
const PORCENTAJES=["0","1","1.75","2","2.75","3","5","8","10"];
let clientes=[],clienteId=null,facturaId=null,editando=false,vista="inicio",vistaClientes="detallada";
let archivosFactura={proforma:null,factura:null},editandoFactura=false,editandoRetencion=false;
try{vistaClientes=localStorage.getItem(VIEW_KEY)==="simple"?"simple":"detallada";}catch(e){}
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const hoy=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const cents=v=>Math.round(Number(v||0)*100);
const money=v=>new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(v/100);
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sum=a=>a.reduce((s,n)=>s+n,0);
const cliente=()=>clientes.find(c=>c.id===clienteId);
const factura=()=>cliente()?.facturas.find(f=>f.id===facturaId);
const abonos=f=>sum(f.abonos.map(a=>a.valor));
const cobrar=f=>f.valor-f.ret;
const saldo=f=>Math.max(0,cobrar(f)-f.anticipos-abonos(f));
const facturado=c=>sum(c.facturas.map(f=>f.valor));
const pagado=c=>sum(c.facturas.map(f=>f.anticipos+abonos(f)));
const deuda=c=>sum(c.facturas.map(saldo));
const cantidadFacturas=()=>sum(clientes.map(c=>c.facturas.length));
function cargar(){try{const data=JSON.parse(localStorage.getItem(KEY)||"[]");clientes=Array.isArray(data)?data:[];}catch(e){clientes=[];}}
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(clientes));return true;}catch(e){alert("No se pudieron guardar los datos. El almacenamiento local puede estar lleno.");return false;}}
function aviso(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(aviso.timer);aviso.timer=setTimeout(()=>$("toast").classList.remove("show"),2400);}
function navegar(v){vista=v;document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===v));document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.nav===v));$("appHeader").classList.toggle("no-header",v!=="inicio");if(v==="inicio")renderInicio();if(v==="clientes")renderClientes();if(v==="detalle")renderDetalle();if(v==="factura")renderFactura();$("btnAgregar").classList.toggle("hidden",v==="datos");window.scrollTo(0,0);}
function abrirModal(id){$(id).classList.remove("hidden");}
function cerrar(){document.querySelectorAll(".overlay").forEach(el=>el.classList.add("hidden"));}
function estado(f){if(saldo(f)===0)return ["Pagada","paid"];if(f.anticipos+abonos(f)>0)return ["Abonada parcialmente","partial"];return ["Pendiente",""];}
function tarjetaCliente(c){return `<article class="customer-card" data-cliente="${safe(c.id)}" tabindex="0" role="button"><div class="customer-top"><div class="avatar">${ICONO_USER}</div><div class="customer-name"><h3>${safe(c.nombre)}</h3><p>RUC: ${safe(c.ruc||"No registrado")}</p></div><span class="chevron">${ICONO_FLECHA}</span></div><div class="customer-divider"></div><div class="customer-metrics"><div><small>Facturado</small><strong>${money(facturado(c))}</strong></div><div><small>Abonos</small><strong>${money(pagado(c))}</strong></div><div><small>Saldo</small><strong class="owed">${money(deuda(c))}</strong></div></div><div class="customer-bottom"><span>${c.facturas.length} facturas emitidas</span><span>Ver estado de cuenta ›</span></div></article>`;}
function tarjetaSimple(c){return `<article class="simple-card" data-cliente="${safe(c.id)}" tabindex="0" role="button"><div class="avatar">${ICONO_USER}</div><div class="simple-identity"><h3>${safe(c.nombre)}</h3><p>RUC: ${safe(c.ruc||"No registrado")}</p></div><div class="simple-amount"><small>Saldo</small><strong>${money(deuda(c))}</strong></div><span class="simple-arrow">${ICONO_FLECHA}</span></article>`;}
function cambiarVistaClientes(tipo){vistaClientes=tipo;try{localStorage.setItem(VIEW_KEY,tipo);}catch(e){}renderClientes();}
function renderInicio(){$("saldoGlobal").textContent=money(sum(clientes.map(deuda)));$("clientesDeudores").textContent=clientes.filter(c=>deuda(c)>0).length+" clientes con saldo";$("totalFacturado").textContent=money(sum(clientes.map(facturado)));$("totalAbonado").textContent=money(sum(clientes.map(pagado)));$("totalFacturas").textContent=cantidadFacturas();$("totalClientes").textContent=clientes.length;const orden=[...clientes].sort((a,b)=>deuda(b)-deuda(a));$("clientesInicio").innerHTML=orden.slice(0,5).map(tarjetaCliente).join("")||`<div class="empty">Agrega tu primer cliente para comenzar.</div>`;}
function renderClientes(){const q=$("buscar").value.toLowerCase().trim();const lista=clientes.filter(c=>c.nombre.toLowerCase().includes(q)||(c.ruc||"").toLowerCase().includes(q));$("contadorClientes").textContent=clientes.length+" clientes";$("vistaSimple").classList.toggle("active",vistaClientes==="simple");$("vistaDetallada").classList.toggle("active",vistaClientes==="detallada");$("vistaSimple").setAttribute("aria-pressed",String(vistaClientes==="simple"));$("vistaDetallada").setAttribute("aria-pressed",String(vistaClientes==="detallada"));$("listaClientes").classList.toggle("simple-list",vistaClientes==="simple");$("listaClientes").innerHTML=lista.map(vistaClientes==="simple"?tarjetaSimple:tarjetaCliente).join("")||`<div class="empty">No hay clientes para mostrar.</div>`;}
function abrirCliente(id){clienteId=id;navegar("detalle");}
function renderDetalle(){const c=cliente();if(!c)return navegar("clientes");$("nombreDetalle").textContent=c.nombre;$("rucDetalle").textContent="RUC: "+(c.ruc||"No registrado");$("avatarDetalle").innerHTML=ICONO_USER;$("saldoDetalle").textContent=money(deuda(c));$("facturasDetalle").textContent=c.facturas.length+" facturas";$("abonosDetalle").textContent=money(pagado(c))+" abonado";$("cantidadFacturas").textContent=c.facturas.length+" registros";$("listaFacturas").innerHTML=c.facturas.map(f=>{const [label,clase]=estado(f);return `<article class="invoice-card" data-factura="${safe(f.id)}" tabindex="0" role="button"><div class="invoice-top"><div class="invoice-identity"><div class="invoice-icon">${ICONO_FACTURA}</div><div><h3>Factura ${safe(f.numero)}</h3><p>${safe(f.fecha)} · ${safe(f.detalle||"Sin detalle")}</p></div></div><span class="pill ${clase}">${label}</span></div><div class="invoice-bottom"><div><small>Saldo por cobrar</small><strong>${money(saldo(f))}</strong></div><div style="text-align:right"><small>Valor factura</small><b>${money(f.valor)}</b></div></div></article>`;}).join("")||`<div class="empty">Este cliente todavía no tiene facturas.</div>`;}
function abrirFactura(id){facturaId=id;navegar("factura");}
/* ENCABEZADO DE FACTURA Y ACCESOS A DOCUMENTOS */
function configurarEncabezadoFactura(){
  const encabezado=document.querySelector("#factura .invoice-page-heading");
  if(encabezado&&!$("documentosEncabezado")){
    const numero=$("numeroFactura");
    const titulo=numero?.closest("h2");
    if(titulo){
      const contenedor=document.createElement("div");
      contenedor.id="documentosEncabezado";
      contenedor.className="documentos-encabezado";
      titulo.insertAdjacentElement("afterend",contenedor);
    }
  }
  const linea=document.querySelector("#factura .receipt-topline");
  if(linea&&!$("btnEditarFactura")){
    const textoUSD=Array.from(linea.children).find(el=>el.textContent.trim()==="USD");
    if(textoUSD){
      const boton=document.createElement("button");
      boton.type="button";
      boton.id="btnEditarFactura";
      boton.className="boton-editar-factura";
      boton.innerHTML=ICONO_LAPIZ+"<span>Editar factura</span>";
      textoUSD.replaceWith(boton);
      boton.addEventListener("click",editarFactura);
    }
  }
  const antiguo=$("adjuntoFactura");
  if(antiguo)antiguo.remove();
}
function renderDocumentosEncabezado(f){
  const contenedor=$("documentosEncabezado");
  if(!contenedor)return;
  const documentos=[{tipo:"proforma",nombre:"Proforma",archivo:f.archivoProforma},{tipo:"factura",nombre:"Factura",archivo:f.archivoFactura||f.archivo}].filter(d=>d.archivo?.contenido);
  if(!documentos.length){contenedor.innerHTML=`<span class="documentos-vacios">Sin archivo adjunto</span>`;return;}
  contenedor.innerHTML=documentos.map(d=>`<button type="button" class="documento-capsula" data-abrir-documento="${d.tipo}" title="${safe(d.archivo.nombre)}">${ICONO_CLIP}<span>${d.nombre}</span></button>`).join("");
  contenedor.querySelectorAll("[data-abrir-documento]").forEach(b=>b.addEventListener("click",()=>{const actual=factura();if(!actual)return;const archivo=b.dataset.abrirDocumento==="proforma"?actual.archivoProforma:(actual.archivoFactura||actual.archivo);if(archivo)abrirAdjunto(archivo);}));
}
/* RETENCIONES */
function configurarInterfazRetencion(){
  const valor=$("recRetencion");
  if(!valor||$("editarRetencion"))return;
  const contenedor=document.createElement("div");
  contenedor.className="retencion-monto-control";
  contenedor.id="retencionMontoControl";
  contenedor.innerHTML=`<button type="button" id="editarRetencion" class="retencion-pencil" title="Editar valor monetario" aria-label="Editar retención">${ICONO_LAPIZ}</button><strong id="retencionValorVisible"></strong><div id="retencionEditor" class="retencion-editor hidden"><span>$</span><input id="retencionMontoInput" type="number" min="0" step="0.01" inputmode="decimal" aria-label="Valor monetario de la retención"><button type="button" id="guardarRetencionMonto" title="Guardar">${ICONO_CHECK}</button><button type="button" id="cancelarRetencionMonto" title="Cancelar">${ICONO_X}</button></div>`;
  valor.replaceWith(contenedor);
  $("editarRetencion").addEventListener("click",activarEdicionRetencion);
  $("guardarRetencionMonto").addEventListener("click",guardarRetencionManual);
  $("cancelarRetencionMonto").addEventListener("click",cancelarEdicionRetencion);
  $("retencionMontoInput").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();guardarRetencionManual();}if(e.key==="Escape"){e.stopPropagation();cancelarEdicionRetencion();}});
}
function configurarRetencion(f){
  const select=$("retencionPorcentaje"),custom=$("retencionPersonalizada");
  custom.classList.add("hidden");
  const pct=typeof f.retPct==="number"&&Number.isFinite(f.retPct)?f.retPct:(f.valor>0?f.ret/f.valor*100:0);
  const opcion=PORCENTAJES.find(p=>Math.round(f.valor*Number(p)/100)===f.ret);
  if(opcion!==undefined){select.value=opcion;custom.value="";}
  else{select.value="custom";custom.value=Number(pct.toFixed(6));custom.classList.remove("hidden");}
}
function actualizarRetencionVisible(f){if($("retencionValorVisible"))$("retencionValorVisible").textContent="− "+money(f.ret);}
function activarEdicionRetencion(){const f=factura();if(!f)return;editandoRetencion=true;$("editarRetencion").classList.add("hidden");$("retencionValorVisible").classList.add("hidden");$("retencionEditor").classList.remove("hidden");$("retencionMontoInput").value=(f.ret/100).toFixed(2);$("retencionMontoInput").focus();$("retencionMontoInput").select();}
function cancelarEdicionRetencion(){editandoRetencion=false;$("retencionEditor")?.classList.add("hidden");$("editarRetencion")?.classList.remove("hidden");$("retencionValorVisible")?.classList.remove("hidden");}
function guardarRetencionManual(){
  const f=factura();if(!f)return;
  const input=$("retencionMontoInput"),texto=input.value.trim();
  if(texto===""||!Number.isFinite(Number(texto))){aviso("Ingresa un valor monetario válido");input.focus();return;}
  const ret=cents(texto);
  if(!Number.isSafeInteger(ret)||ret<0){aviso("La retención no puede ser negativa");input.focus();return;}
  if(ret+f.anticipos+abonos(f)>f.valor){aviso("La retención supera el saldo disponible");input.focus();return;}
  const anteriorRet=f.ret,anteriorPct=f.retPct;
  f.ret=ret;f.retPct=f.valor>0?Number((ret/f.valor*100).toFixed(8)):0;
  if(!guardar()){f.ret=anteriorRet;if(anteriorPct===undefined)delete f.retPct;else f.retPct=anteriorPct;return;}
  cancelarEdicionRetencion();renderFactura();aviso("Retención actualizada");
}
function cambiarRetencion(){
  const f=factura();if(!f)return;
  const select=$("retencionPorcentaje"),custom=$("retencionPersonalizada"),valor=select.value;
  if(valor==="custom"){custom.classList.remove("hidden");if(custom.value===""){custom.focus();return;}}else custom.classList.add("hidden");
  if(valor==="fixed"){configurarRetencion(f);aviso("Usa el lápiz para editar el valor monetario");return;}
  const pct=Number(valor==="custom"?custom.value:valor);
  if(!Number.isFinite(pct)||pct<0||pct>100){aviso("Ingresa un porcentaje entre 0 y 100");return;}
  const ret=Math.round(f.valor*pct/100);
  if(ret+f.anticipos+abonos(f)>f.valor){aviso("La retención supera el saldo disponible");configurarRetencion(f);return;}
  const anteriorRet=f.ret,anteriorPct=f.retPct;
  f.ret=ret;f.retPct=pct;
  if(!guardar()){f.ret=anteriorRet;if(anteriorPct===undefined)delete f.retPct;else f.retPct=anteriorPct;configurarRetencion(f);return;}
  cancelarEdicionRetencion();renderFactura();aviso("Retención actualizada");
}
function renderFactura(){
  const f=factura(),c=cliente();if(!f||!c)return navegar("detalle");
  configurarEncabezadoFactura();
  $("numeroFactura").textContent=f.numero;
  renderDocumentosEncabezado(f);
  const [label,clase]=estado(f);
  $("estadoFactura").textContent=label;$("estadoFactura").className="pill "+clase;
  $("recCliente").textContent=c.nombre;$("recRuc").textContent="RUC: "+(c.ruc||"No registrado");
  $("recFecha").textContent=f.fecha;$("recDetalle").textContent=f.detalle||"Servicio / producto";
  $("recPrecio").textContent=money(f.valor);$("recValor").textContent=money(f.valor);
  $("recSubtotal").textContent=money(f.valor);$("recTotal").textContent=money(cobrar(f));
  configurarInterfazRetencion();actualizarRetencionVisible(f);configurarRetencion(f);cancelarEdicionRetencion();
  $("cantidadAbonos").textContent=f.abonos.length+" movimientos";
  $("listaAbonos").innerHTML=f.abonos.map(a=>`<div class="abono-card"><div class="abono-icon">${ICONO_ABONO}</div><div class="abono-text"><small>${safe(a.fecha)}${a.banco?` · Banco ${safe(a.banco)}`:""}${a.tipoCuenta?` · ${safe(a.tipoCuenta)}`:""}</small><strong>+ ${money(a.valor)}</strong></div><button class="delete-mini" data-borrar-abono="${safe(a.id)}">Eliminar</button></div>`).join("")||`<div class="empty">Todavía no hay anticipos registrados.</div>`;
}
function nuevoCliente(editar=false){editando=editar;$("formCliente").reset();$("tituloCliente").textContent=editar?"Editar cliente":"Nuevo cliente";if(editar){const c=cliente();if(!c)return;$("cNombre").value=c.nombre;$("cRuc").value=c.ruc||"";}abrirModal("modalCliente");}
function guardarCliente(e){e.preventDefault();const nombre=$("cNombre").value.trim(),ruc=$("cRuc").value.trim();if(!nombre)return;const anterior=JSON.stringify(clientes);if(editando)Object.assign(cliente(),{nombre,ruc});else clientes.push({id:uid(),nombre,ruc,facturas:[]});if(!guardar()){clientes=JSON.parse(anterior);return;}cerrar();navegar(editando?"detalle":"clientes");aviso("Cliente guardado");}
/* FORMULARIO DE FACTURA: NUEVA Y EDICIÓN */
function configurarFormularioFactura(){
  const form=$("formFactura");if(!form)return;
  form.innerHTML=`<label for="fNumero"># Factura</label><input id="fNumero" required maxlength="60" placeholder="Ej. 001-001-000000123"><label for="fFecha">Fecha</label><input type="date" id="fFecha" required><label for="fDetalle">Detalle</label><input id="fDetalle" maxlength="300" placeholder="Descripción de la factura"><label for="fValor">Valor factura</label><input type="number" id="fValor" min="0.01" step="0.01" required placeholder="0.00"><div class="documentos-titulo">Documentos adjuntos</div><div class="documentos-grid"><div class="documento-columna"><div class="documento-label">Proforma</div><div id="zonaProforma" class="documento-zona"></div><input type="file" id="inputProforma" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" hidden></div><div class="documento-columna"><div class="documento-label">Factura</div><div id="zonaFactura" class="documento-zona"></div><input type="file" id="inputFactura" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" hidden></div></div><p class="documentos-nota">PDF, PNG o JPG. Máximo 1,5 MB por archivo.</p><button class="submit" type="submit" id="guardarFormularioFactura">Guardar factura</button>`;
  configurarZonaArchivo("proforma");configurarZonaArchivo("factura");actualizarTodasZonas();
}
function configurarZonaArchivo(tipo){
  const input=$(tipo==="proforma"?"inputProforma":"inputFactura"),zona=$(tipo==="proforma"?"zonaProforma":"zonaFactura");
  input.addEventListener("change",async()=>{const archivo=input.files?.[0];if(archivo)await seleccionarArchivo(tipo,archivo);});
  zona.addEventListener("click",e=>{if(e.target.closest("[data-eliminar-archivo]")){e.stopPropagation();eliminarArchivo(tipo);return;}if(e.target.closest("[data-seleccionar-archivo]"))input.click();});
  zona.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-seleccionar-archivo]")){e.preventDefault();input.click();}});
  ["dragenter","dragover"].forEach(evento=>zona.addEventListener(evento,e=>{e.preventDefault();if(!archivosFactura[tipo])zona.classList.add("arrastrando");}));
  ["dragleave","dragend"].forEach(evento=>zona.addEventListener(evento,e=>{e.preventDefault();zona.classList.remove("arrastrando");}));
  zona.addEventListener("drop",async e=>{e.preventDefault();zona.classList.remove("arrastrando");if(archivosFactura[tipo])return;const archivo=e.dataTransfer?.files?.[0];if(archivo)await seleccionarArchivo(tipo,archivo);});
}
function iconoArchivo(archivo){return archivo.tipo==="application/pdf"?ICONO_PDF:ICONO_IMAGEN;}
function actualizarZonaArchivo(tipo){
  const zona=$(tipo==="proforma"?"zonaProforma":"zonaFactura");if(!zona)return;
  const archivo=archivosFactura[tipo];
  if(!archivo){zona.innerHTML=`<div class="documento-drop" data-seleccionar-archivo role="button" tabindex="0" aria-label="Subir ${tipo}"><div class="documento-upload-icon">${ICONO_SUBIR}</div><strong>Subir archivo</strong><small>Seleccionar o arrastrar</small><span>PDF · PNG · JPG</span></div>`;return;}
  zona.innerHTML=`<div class="documento-cargado"><div class="documento-cargado-icon">${iconoArchivo(archivo)}</div><div class="documento-cargado-nombre" title="${safe(archivo.nombre)}">${safe(archivo.nombre)}</div><small>${(archivo.tamano/1024).toFixed(1)} KB</small><button type="button" class="documento-eliminar" data-eliminar-archivo aria-label="Eliminar ${tipo}">${ICONO_BASURA}<span>Eliminar</span></button></div>`;
}
function actualizarTodasZonas(){actualizarZonaArchivo("proforma");actualizarZonaArchivo("factura");}
function eliminarArchivo(tipo){archivosFactura[tipo]=null;const input=$(tipo==="proforma"?"inputProforma":"inputFactura");if(input)input.value="";actualizarZonaArchivo(tipo);aviso("Archivo eliminado");}
function tipoArchivoValido(a){const ext=a.name.toLowerCase().split(".").pop();return a.type==="application/pdf"&&ext==="pdf"||a.type==="image/png"&&ext==="png"||a.type==="image/jpeg"&&["jpg","jpeg"].includes(ext);}
function leerArchivoBase64(archivo){return new Promise((resolve,reject)=>{const lector=new FileReader();lector.onload=()=>resolve(lector.result);lector.onerror=()=>reject(new Error("No se pudo leer el archivo"));lector.readAsDataURL(archivo);});}
async function seleccionarArchivo(tipo,archivo){
  if(archivosFactura[tipo]){aviso("Elimina el archivo actual antes de subir otro");return;}
  if(!tipoArchivoValido(archivo)){aviso("Solo se permiten PDF, PNG y JPG");return;}
  if(archivo.size>MAX_ARCHIVO){aviso("El archivo supera 1,5 MB");return;}
  try{const contenido=await leerArchivoBase64(archivo);archivosFactura[tipo]={nombre:archivo.name,tipo:archivo.type,tamano:archivo.size,contenido};actualizarZonaArchivo(tipo);aviso("Archivo cargado");}catch(e){aviso("No se pudo leer el archivo");}
}
function prepararFormularioFactura(editar=false){
  const form=$("formFactura"),f=editar?factura():null;
  if(editar&&!f)return;
  editandoFactura=editar;
  form.reset();
  $("fNumero").value=f?.numero||"";
  $("fFecha").value=f?.fecha||hoy();
  $("fDetalle").value=f?.detalle||"";
  $("fValor").value=f?(f.valor/100).toFixed(2):"";
  archivosFactura={proforma:f?.archivoProforma?{...f.archivoProforma}:null,factura:(f?.archivoFactura||f?.archivo)?{...(f.archivoFactura||f.archivo)}:null};
  actualizarTodasZonas();
  const titulo=document.querySelector("#modalFactura .sheet h3");
  if(titulo)titulo.textContent=editar?"Editar factura":"Nueva factura";
  $("guardarFormularioFactura").textContent=editar?"Guardar cambios":"Guardar factura";
  abrirModal("modalFactura");
}
function nuevaFactura(){prepararFormularioFactura(false);}
function editarFactura(){prepararFormularioFactura(true);}
function guardarFactura(e){
  e.preventDefault();
  const c=cliente();if(!c)return;
  const valor=cents($("fValor").value),numero=$("fNumero").value.trim(),fecha=$("fFecha").value,detalle=$("fDetalle").value.trim();
  if(!Number.isSafeInteger(valor)||valor<=0){alert("Ingresa un valor válido.");return;}
  if(!numero||!fecha){alert("Completa el número y la fecha de la factura.");return;}
  if(c.facturas.some(f=>f.numero.toLowerCase()===numero.toLowerCase()&&(!editandoFactura||f.id!==facturaId))){alert("Ya existe una factura con ese número para este cliente.");return;}
  if(editandoFactura){
    const f=factura();if(!f)return;
    if(valor<f.ret+f.anticipos+abonos(f)){alert("El nuevo valor de la factura no puede ser menor que la retención y los anticipos registrados.");return;}
    const anterior={...f};
    f.numero=numero;f.fecha=fecha;f.detalle=detalle;f.valor=valor;
    if(f.retPct!==undefined)f.retPct=valor>0?Number((f.ret/valor*100).toFixed(8)):0;
    delete f.archivoProforma;delete f.archivoFactura;delete f.archivo;
    if(archivosFactura.proforma)f.archivoProforma={...archivosFactura.proforma};
    if(archivosFactura.factura)f.archivoFactura={...archivosFactura.factura};
    if(!guardar()){Object.keys(f).forEach(k=>delete f[k]);Object.assign(f,anterior);return;}
    cerrar();renderFactura();aviso("Factura actualizada");
  }else{
    const nueva={id:uid(),numero,fecha,detalle,valor,ret:0,retPct:0,anticipos:0,proforma:"",cheque:"",transf:"",banco:"",cuenta:"",abonos:[]};
    if(archivosFactura.proforma)nueva.archivoProforma={...archivosFactura.proforma};
    if(archivosFactura.factura)nueva.archivoFactura={...archivosFactura.factura};
    c.facturas.unshift(nueva);
    if(!guardar()){c.facturas.shift();return;}
    cerrar();navegar("detalle");aviso("Factura registrada");
  }
  archivosFactura={proforma:null,factura:null};editandoFactura=false;
}
function abrirAdjunto(archivo){
  const contenido=archivo?.contenido;
  if(typeof contenido!=="string"||!/^data:(application\/pdf|image\/png|image\/jpeg);base64,/i.test(contenido)){aviso("No se puede abrir el archivo");return;}
  try{const [cabecera,base64]=contenido.split(","),tipo=cabecera.slice(5).split(";")[0],binario=atob(base64),bytes=new Uint8Array(binario.length);for(let i=0;i<binario.length;i++)bytes[i]=binario.charCodeAt(i);const blob=new Blob([bytes],{type:tipo}),url=URL.createObjectURL(blob),enlace=document.createElement("a");enlace.href=url;enlace.target="_blank";enlace.rel="noopener noreferrer";enlace.download=archivo.nombre||"documento";document.body.appendChild(enlace);enlace.click();enlace.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(e){aviso("No se pudo abrir el documento");}
}
/* ESTILOS */
function aplicarEstilosFactura(){
  const style=document.createElement("style");
  style.textContent=`
  .documentos-titulo{font-size:15px;font-weight:750;color:#182b46;margin:24px 0 12px}
  .documentos-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
  .documento-columna,.documento-zona{min-width:0}
  .documento-label{font-size:13px;font-weight:750;color:#53657b;margin-bottom:9px}
  .documento-drop{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px;text-align:center;height:168px;padding:14px 7px;border:1.5px dashed #c6d4e7;border-radius:13px;background:#f7faff;color:#092d62;cursor:pointer;transition:background .2s,border-color .2s;outline:none}
  .documento-drop:hover,.documento-drop:focus-visible,.documento-zona.arrastrando .documento-drop{border-color:#2468b7;background:#eaf3ff}
  .documento-upload-icon{width:43px;height:43px;border-radius:12px;display:grid;place-items:center;background:#e7effb;color:#092d62}
  .documento-drop strong{font-size:13px;font-weight:750}
  .documento-drop small{font-size:11px;color:#697b92;line-height:1.4}
  .documento-drop>span{font-size:10px;font-weight:700;color:#8b9bb0}
  .documento-cargado{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;height:168px;padding:12px 8px;border:1px solid #d8e5f3;border-radius:13px;background:#eef5ff;text-align:center;min-width:0}
  .documento-cargado-icon{display:grid;place-items:center;width:37px;height:37px;border-radius:10px;color:#092d62;background:#dfeafa;flex-shrink:0}
  .documento-cargado-nombre{font-size:12px;font-weight:750;color:#092d62;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .documento-cargado>small{font-size:10px;color:#697b92}
  .documento-eliminar{display:flex;align-items:center;justify-content:center;gap:5px;border:0;border-radius:8px;background:#fff;color:#bd4545;padding:7px 11px;font-size:11px;font-weight:750;cursor:pointer}
  .documentos-nota{color:#697b92;font-size:12px;margin:12px 0 0}
  .retencion-monto-control{display:flex;align-items:center;justify-content:flex-end;gap:6px;min-width:0;flex-shrink:0}
  .retencion-monto-control>strong{font-size:inherit;font-weight:800;white-space:nowrap;color:inherit}
  .retencion-pencil{display:grid;place-items:center;width:29px;height:29px;border:0;border-radius:8px;background:#eaf1fc;color:#092d62;cursor:pointer;flex-shrink:0}
  .retencion-pencil:hover{background:#dceafa}
  .retencion-editor{display:flex;align-items:center;gap:4px;padding:4px;border:1px solid #c7d7ec;border-radius:9px;background:#fff;min-width:0}
  .retencion-editor>span{font-size:13px;font-weight:750;color:#092d62;padding-left:5px}
  .retencion-editor input{width:83px;min-width:0;height:32px;margin:0!important;padding:4px 5px!important;border:0!important;background:transparent!important;font-size:14px;font-weight:750;color:#092d62;text-align:right;outline:none}
  .retencion-editor button{display:grid;place-items:center;width:27px;height:29px;border:0;border-radius:6px;background:#eaf1fc;color:#092d62;cursor:pointer;flex-shrink:0}
  .retencion-editor button:last-child{background:#fff1f1;color:#bd4545}
  .retencion-monto-control .hidden{display:none!important}
  .boton-editar-factura{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #d5e1f1;border-radius:9px;background:#f0f5fc;color:#092d62;padding:8px 11px;font-size:12px;font-weight:750;cursor:pointer;white-space:nowrap;text-transform:none;letter-spacing:0}
  .boton-editar-factura:hover{background:#e1edfc}
  .boton-editar-factura svg{width:15px;height:15px;flex-shrink:0}
  .documentos-encabezado{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin-top:9px}
  .documento-capsula{display:inline-flex;align-items:center;gap:5px;border:1px solid #d6e3f5;border-radius:999px;padding:6px 11px;background:#edf4ff;color:#092d62;font-size:11px;font-weight:750;line-height:1.2;cursor:pointer}
  .documento-capsula:hover{background:#dceafa}
  .documento-capsula svg{width:13px;height:13px;flex-shrink:0}
  .documentos-vacios{font-size:12px;font-weight:500;color:#a3adbc}
  @media(max-width:380px){.retencion-editor input{width:62px;font-size:12px}.retencion-editor{gap:2px}.retencion-editor button{width:24px}.retencion-pencil{width:26px}.boton-editar-factura{padding:7px 8px;font-size:11px}}
  @media(max-width:350px){.documentos-grid{gap:8px}.documento-drop{padding:10px 5px}.documento-drop strong{font-size:12px}.documento-drop small{font-size:10px}.documento-cargado-nombre{font-size:11px}}
  `;
  document.head.appendChild(style);
}
/* ANTICIPOS */
function logoBanco(banco){const info=BANCOS[banco];if(!info)return `<span class="bank-initial">B</span>`;return `<img src="https://www.google.com/s2/favicons?domain=${info.dominio}&sz=64" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="bank-initial bank-fallback" style="display:none">${info.inicial}</span>`;}
function actualizarLogoBanco(){const contenedor=$("aBancoLogo"),selector=$("aBanco");if(contenedor&&selector)contenedor.innerHTML=logoBanco(selector.value);}
function nuevoAbono(){const f=factura();if(!f||saldo(f)===0){aviso("Esta factura no tiene saldo pendiente");return;}$("formAbono").reset();$("aFecha").value=hoy();$("saldoDisponible").textContent=money(saldo(f));$("aValor").max=(saldo(f)/100).toFixed(2);actualizarLogoBanco();abrirModal("modalAbono");}
function guardarAbono(e){e.preventDefault();const f=factura();if(!f)return;const valor=cents($("aValor").value);if(!Number.isSafeInteger(valor)||valor<=0||valor>saldo(f)){alert("El anticipo debe ser mayor que cero y no superar el saldo pendiente.");return;}const banco=$("aBanco").value,tipoCuenta=$("aTipoCuenta").value;if(!BANCOS[banco]||!["Ahorro","Corriente"].includes(tipoCuenta)){alert("Selecciona un banco y un tipo de cuenta válidos.");return;}f.abonos.unshift({id:uid(),fecha:$("aFecha").value,valor,banco,tipoCuenta});if(!guardar()){f.abonos.shift();return;}cerrar();renderFactura();aviso("Anticipo registrado");}
function borrarAbono(id){const f=factura();if(!f||!confirm("¿Eliminar este anticipo?"))return;const anterior=[...f.abonos];f.abonos=f.abonos.filter(a=>a.id!==id);if(!guardar()){f.abonos=anterior;return;}renderFactura();aviso("Anticipo eliminado");}
function borrarFactura(){const c=cliente(),f=factura();if(!c||!f||!confirm("¿Eliminar esta factura y todos sus anticipos?"))return;const anterior=[...c.facturas];c.facturas=c.facturas.filter(x=>x.id!==facturaId);if(!guardar()){c.facturas=anterior;return;}navegar("detalle");aviso("Factura eliminada");}
/* EXPORTAR E IMPORTAR JSON */
function exportar(){const blob=new Blob([JSON.stringify(clientes,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="mi-cartera-"+hoy()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$("menu").classList.add("hidden");}
function archivoValidoEnRespaldo(a){return a&&typeof a.nombre==="string"&&typeof a.tipo==="string"&&typeof a.contenido==="string"&&Number.isSafeInteger(a.tamano)&&a.tamano>=0&&a.tamano<=MAX_ARCHIVO&&["application/pdf","image/png","image/jpeg"].includes(a.tipo)&&a.contenido.startsWith("data:"+a.tipo+";base64,");}
function validar(datos){
  if(!Array.isArray(datos))return false;
  const ids=new Set();
  for(const c of datos){
    if(!c||typeof c.id!=="string"||ids.has(c.id)||typeof c.nombre!=="string"||!c.nombre.trim()||!Array.isArray(c.facturas))return false;
    ids.add(c.id);const fi=new Set();
    for(const f of c.facturas){
      if(!f||typeof f.id!=="string"||fi.has(f.id)||typeof f.numero!=="string"||typeof f.fecha!=="string"||!Number.isSafeInteger(f.valor)||f.valor<=0||!Number.isSafeInteger(f.ret)||f.ret<0||!Number.isSafeInteger(f.anticipos)||f.anticipos<0||!Array.isArray(f.abonos))return false;
      if(f.retPct!==undefined&&(!Number.isFinite(f.retPct)||f.retPct<0||f.retPct>100))return false;
      for(const campo of ["archivo","archivoProforma","archivoFactura"])if(f[campo]!==undefined&&!archivoValidoEnRespaldo(f[campo]))return false;
      fi.add(f.id);const ai=new Set();
      for(const a of f.abonos){if(!a||typeof a.id!=="string"||ai.has(a.id)||typeof a.fecha!=="string"||!Number.isSafeInteger(a.valor)||a.valor<=0||(a.banco!==undefined&&!BANCOS[a.banco])||(a.tipoCuenta!==undefined&&!["Ahorro","Corriente"].includes(a.tipoCuenta)))return false;ai.add(a.id);}
      if(f.ret+f.anticipos+abonos(f)>f.valor)return false;
    }
  }
  return true;
}
async function importar(e){const file=e.target.files[0];if(!file)return;try{const datos=JSON.parse(await file.text());if(!validar(datos))throw Error("Archivo inválido");if(!confirm("¿Reemplazar todos los datos actuales por este respaldo?"))return;const anteriores=clientes;clientes=datos;if(!guardar()){clientes=anteriores;return;}clienteId=null;facturaId=null;navegar("inicio");aviso("Respaldo importado");}catch(err){alert("No se pudo importar el respaldo.");}finally{e.target.value="";$("menu").classList.add("hidden");}}
/* EVENTOS */
function agregar(){if(vista==="factura")nuevoAbono();else if(vista==="detalle")nuevaFactura();else nuevoCliente();}
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navegar(b.dataset.nav)));
$("vistaSimple").addEventListener("click",()=>cambiarVistaClientes("simple"));
$("vistaDetallada").addEventListener("click",()=>cambiarVistaClientes("detallada"));
$("retencionPorcentaje").addEventListener("change",cambiarRetencion);
$("retencionPersonalizada").addEventListener("change",cambiarRetencion);
$("btnAgregar").addEventListener("click",agregar);
$("volverClientes").addEventListener("click",()=>navegar("clientes"));
$("volverDetalle").addEventListener("click",()=>navegar("detalle"));
$("editarCliente").addEventListener("click",()=>nuevoCliente(true));
$("buscar").addEventListener("input",renderClientes);
$("formCliente").addEventListener("submit",guardarCliente);
$("formFactura").addEventListener("submit",guardarFactura);
$("formAbono").addEventListener("submit",guardarAbono);
$("aBanco").addEventListener("change",actualizarLogoBanco);
$("eliminarFactura").addEventListener("click",borrarFactura);
$("btnMenu").addEventListener("click",()=>$("menu").classList.toggle("hidden"));
$("exportar").addEventListener("click",exportar);
$("exportarDatos").addEventListener("click",exportar);
$("importarDatos").addEventListener("click",()=>$("archivo").click());
$("importar").addEventListener("click",()=>$("archivo").click());
$("archivo").addEventListener("change",importar);
document.querySelectorAll(".close").forEach(b=>b.addEventListener("click",cerrar));
document.querySelectorAll(".overlay").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)cerrar();}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")cerrar();if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-cliente],[data-factura]")){e.preventDefault();e.target.click();}});
document.addEventListener("click",e=>{const ab=e.target.closest("[data-borrar-abono]");if(ab){borrarAbono(ab.dataset.borrarAbono);return;}const f=e.target.closest("[data-factura]");if(f){abrirFactura(f.dataset.factura);return;}const c=e.target.closest("[data-cliente]");if(c)abrirCliente(c.dataset.cliente);});
/* INICIALIZACIÓN */
configurarFormularioFactura();
aplicarEstilosFactura();
configurarEncabezadoFactura();
cargar();
navegar("inicio");
