(function(){
const ADMIN_PASSWORD='eko76**lavan';
const MAX_ATTEMPTS=3;
const BLOCK_TIME=30000;
let adminAttempts=0;
let blockedUntil=0;
let autoSaveInterval=null;
const PRECIOS_SERVICIO={
'1-2':{Economico:400,Basico:700,Premium:800,Especial:900},
'3-4':{Economico:500,Basico:900,Premium:1000,Especial:1100},
'5-6':{Economico:600,Basico:1100,Premium:1200,Especial:1300},
'7':{Economico:700,Basico:1300,Premium:1400,Especial:1500}};
const COSTO_MENSAJERIA={'Zona Corta $600':600,'Zona Media $900':900,'Zona Larga $1200':1200};
const ZONAS_KEYWORDS={'corta':'Zona Corta $600','media':'Zona Media $900','larga':'Zona Larga $1200','centro':'Zona Corta $600','sur':'Zona Media $900','norte':'Zona Larga $1200'};
const claveModal=document.getElementById('claveModal');
const adminModal=document.getElementById('adminModal');
const validarBtn=document.getElementById('validarClaveBtn');
const verHistorialBtn=document.getElementById('verHistorialBtn');
const historialModal=document.getElementById('historialModal');
const limpiarHistorialBtn=document.getElementById('limpiarHistorialBtn');
function getVal(id,def=''){const el=document.getElementById(id);if(!el)return def;if(el.tagName==='SELECT'||el.tagName==='INPUT'||el.tagName==='TEXTAREA')return el.value.trim()||def;return def;}
function getCheckboxVal(id){const el=document.getElementById(id);return el?el.checked:false;}
function setVal(id,val){const el=document.getElementById(id);if(el) el.value=val;}
function showToast(msg,isError=false){if(typeof window.showToast==='function')window.showToast(msg,isError);else (isError?console.error:console.log)(msg),alert(msg);}
function generarNumeroOrden(){const now=new Date();const fecha=`${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;const random=Math.random().toString(36).substring(2,6).toUpperCase();return `${fecha}-${random}`;}
function obtenerHistorialCompleto(){const guardado=localStorage.getItem('eko_ordenes_historial');return guardado?JSON.parse(guardado):[];}
function guardarOrdenEnHistorial(ordenData){const historial=obtenerHistorialCompleto();ordenData.fechaRegistro=new Date().toISOString();historial.unshift(ordenData);localStorage.setItem('eko_ordenes_historial',JSON.stringify(historial));showToast('✅ Orden guardada en el historial');}
function eliminarOrdenDelHistorial(index){const historial=obtenerHistorialCompleto();if(index>=0&&index<historial.length){historial.splice(index,1);localStorage.setItem('eko_ordenes_historial',JSON.stringify(historial));showToast('🗑️ Orden eliminada');mostrarHistorial();}}
function limpiarHistorialCompleto(){localStorage.removeItem('eko_ordenes_historial');showToast('Historial de órdenes borrado');}
function cargarOrdenEnFormulario(orden){
setVal('ordenNo',orden.ordenNo||'');
setVal('clienteNombre',orden.clienteNombre||'');
setVal('adminTelefono',orden.telefono||'');
setVal('fechaRecepcion',orden.fechaRecepcion||'');
setVal('fechaEntrega',orden.fechaEntrega||'');
setVal('adminDireccion',orden.direccion||'');
setVal('domicilioZona',orden.zonaMensajeria||'Zona Corta $600');
setVal('pesoRango',orden.pesoRango||'1-2');
setVal('tipoServicio',orden.tipoServicio||'Economico');
['extraColor','extraBlanca','extraOscura','extraPerfume','extraPerla','extraFragancia'].forEach(ext=>{const chk=document.getElementById(ext);if(chk)chk.checked=orden.extras&&orden.extras[ext];});
if(orden.ropaSucia)document.getElementById('ropaSucia').checked=true;
else if(orden.ropaSemisucia)document.getElementById('ropaSemisucia').checked=true;
else document.getElementById('ropaLimpia').checked=true;
setVal('prendas',orden.prendas||'');
setVal('planchadoTexto',orden.planchadoTexto||'');
setVal('costoPlanchado',orden.costoPlanchado||0);
if(document.getElementById('msgRecogida'))document.getElementById('msgRecogida').checked=orden.msgRecogida||false;
if(document.getElementById('msgEntrega'))document.getElementById('msgEntrega').checked=orden.msgEntrega||false;
setVal('direccionMensajeria',orden.direccionMensajeria||'');
setVal('pagoRecibido',orden.pagoRecibido||0);setVal('firmaEncargado',orden.firmaEncargado||'');
setVal('firmaCliente',orden.firmaCliente||'');
setVal('piezasTexto',orden.piezasTexto||'');
actualizarTotales();
showToast('📋 Orden cargada desde historial');
}
function calcularTotalServicio(){const peso=getVal('pesoRango','1-2');const tipo=getVal('tipoServicio','Economico');return PRECIOS_SERVICIO[peso]?.[tipo]||0;}
function calcularExtras(){let total=0;if(getCheckboxVal('extraColor'))total+=300;if(getCheckboxVal('extraBlanca'))total+=300;if(getCheckboxVal('extraOscura'))total+=300;if(getCheckboxVal('extraPerfume'))total+=300;if(getCheckboxVal('extraPerla'))total+=300;if(getCheckboxVal('extraFragancia'))total+=300;return total;}
function calcularEstadoRopa(){if(getCheckboxVal('ropaSucia'))return 400;if(getCheckboxVal('ropaSemisucia'))return 200;return 0;}
function calcularMensajeria(){const zona=getVal('domicilioZona','Zona Corta $600');return COSTO_MENSAJERIA[zona]||0;}
function actualizarTotales(){
const servicio=calcularTotalServicio();
const extras=calcularExtras();
const estadoRopa=calcularEstadoRopa();
const planchado=parseFloat(getVal('costoPlanchado','0'))||0;
const mensajeria=calcularMensajeria();
const total=servicio+extras+estadoRopa+planchado+mensajeria;
document.getElementById('servicioMonto').innerText=`$${servicio}`;
document.getElementById('extrasMonto').innerText=`$${extras}`;
document.getElementById('estadoRopaMonto').innerText=`$${estadoRopa}`;
document.getElementById('planchadoMonto').innerText=`$${planchado}`;
document.getElementById('mensajeriaMonto').innerText=`$${mensajeria}`;
document.getElementById('totalGeneral').innerText=`$${total}`;
const pagoTotalInput=document.getElementById('pagoTotal');
if(pagoTotalInput)pagoTotalInput.value=total;
const recibido=parseFloat(getVal('pagoRecibido','0'))||0;
const cambio=recibido-total;
const cambioSpan=document.getElementById('cambioMonto');
if(cambioSpan)cambioSpan.innerText=cambio>=0?`$${cambio}`:`-$${Math.abs(cambio)}`;
}
function getSugerencias(campo,texto){if(!texto||texto.length<2)return[];const historial=obtenerHistorialCompleto();const valores=historial.map(ord=>ord[campo]).filter(v=>v&&v.toLowerCase().includes(texto.toLowerCase()));return[...new Set(valores)];}
function setupAutocomplete(inputId,campo){const input=document.getElementById(inputId);if(!input)return;let datalistId=`${inputId}_datalist`;let datalist=document.getElementById(datalistId);if(!datalist){datalist=document.createElement('datalist');datalist.id=datalistId;input.setAttribute('list',datalistId);input.parentNode.appendChild(datalist);}input.addEventListener('input',()=>{const texto=input.value;const sugerencias=getSugerencias(campo,texto);datalist.innerHTML='';sugerencias.forEach(sug=>{const option=document.createElement('option');option.value=sug;datalist.appendChild(option);});});}
function autoCompletarCliente(){const nombre=getVal('clienteNombre');if(!nombre)return;const historial=obtenerHistorialCompleto();const ordenSimilar=historial.find(ord=>ord.clienteNombre===nombre);if(ordenSimilar){if(!getVal('adminTelefono'))setVal('adminTelefono',ordenSimilar.telefono);if(!getVal('adminDireccion'))setVal('adminDireccion',ordenSimilar.direccion);if(!getVal('domicilioZona'))setVal('domicilioZona',ordenSimilar.zonaMensajeria);if(!getVal('firmaCliente'))setVal('firmaCliente',ordenSimilar.firmaCliente);actualizarTotales();showToast(`🔄 Autocompletado con datos de ${nombre}`);}}
function sugerirZonaPorDireccion(){const direccion=getVal('adminDireccion').toLowerCase();if(!direccion)return;for(let[key,zona]of Object.entries(ZONAS_KEYWORDS)){if(direccion.includes(key)){setVal('domicilioZona',zona);actualizarTotales();break;}}}
function generarTXT(){
const ordenNo=getVal('ordenNo')||generarNumeroOrden();
const cliente=getVal('clienteNombre')||'—';
const telefono=getVal('adminTelefono')||'—';
const fechaRecepcion=getVal('fechaRecepcion')||'—';
const fechaEntrega=getVal('fechaEntrega')||'—';
const direccion=getVal('adminDireccion')||'—';
const zona=getVal('domicilioZona')||'—';
const pesoRango=getVal('pesoRango');
const tipoServicio=getVal('tipoServicio');
const servicioPrecio=calcularTotalServicio();
const extrasMap={'Ropa COLOR':getCheckboxVal('extraColor'),'Ropa BLANCA':getCheckboxVal('extraBlanca'),'Ropa OSCURA':getCheckboxVal('extraOscura'),'Perfume':getCheckboxVal('extraPerfume'),'Perla Olor':getCheckboxVal('extraPerla'),'Fragancia':getCheckboxVal('extraFragancia')};
const estadoRopa=getCheckboxVal('ropaSucia')?'Sucia (+$400)':(getCheckboxVal('ropaSemisucia')?'Semisucia (+$200)':'Ninguno');
const prendas=getVal('prendas')||'';
const planchadoTexto=getVal('planchadoTexto')||'';
const costoPlanchado=parseFloat(getVal('costoPlanchado','0'))||0;const msgRecogida=getCheckboxVal('msgRecogida');
const msgEntrega=getCheckboxVal('msgEntrega');
const direccionMensajeria=getVal('direccionMensajeria')||'';
const servicioMonto=servicioPrecio;
const extrasMonto=calcularExtras();
const estadoMonto=calcularEstadoRopa();
const mensajeriaMonto=calcularMensajeria();
const total=servicioMonto+extrasMonto+estadoMonto+costoPlanchado+mensajeriaMonto;
const recibido=parseFloat(getVal('pagoRecibido','0'))||0;
const cambio=recibido-total;
const firmaEncargado=getVal('firmaEncargado')||'______________________________';
const firmaCliente=getVal('firmaCliente')||'______________________________';
const piezasTexto=getVal('piezasTexto')||'';
let txt='';
txt+='╔══════════════════════════════════════════════════════════════════════╗\n';
txt+='║                          LAVANDERÍA EKO                               ║\n';
txt+='║                         ORDEN DE SERVICIO                            ║\n';
txt+='╠══════════════════════════════════════════════════════════════════════╣\n';
txt+=`║ N° ORDEN: ${ordenNo.padEnd(38)}N° ORDEN: ${ordenNo.padEnd(20)}║\n`;
txt+='╠══════════════════════════════════════════════════════════════════════╣\n';
txt+=`║ Cliente: ${cliente.padEnd(42)}┊ Lavandera: ║\n`;
txt+=`║ Teléfono: ${telefono.padEnd(42)}┊ Recepción: ${fechaRecepcion.padEnd(24)}║\n`;
txt+=`║ ${' '.repeat(42)}┊ Entrega: ${fechaEntrega.padEnd(24)}║\n`;
txt+='╚══════════════════════════════════════════════════════════════════════╝\n';
txt+='\n▸ SERVICIOS POR CARGA (hasta 7kg) ◂\n  Prelavado + Lavado + Secado + Doblado\n\n';
txt+='┌───────────┬────────────┬──────────┬────────────┬────────────┐\n';
txt+='│  Peso     │ Económico  │ Básico   │ Premium    │ Especial   │\n';
txt+='├───────────┼────────────┼──────────┼────────────┼────────────┤\n';
txt+='│  1–2 kg   │    $400    │   $700   │    $800    │    $900    │\n';
txt+='│  3–4 kg   │    $500    │   $900   │   $1.000   │   $1.100   │\n';
txt+='│  5–6 kg   │    $600    │  $1.100  │   $1.200   │   $1.300   │\n';
txt+='│   7 kg    │    $700    │  $1.300  │   $1.400   │   $1.500   │\n';
txt+='└───────────┴────────────┴──────────┴────────────┴────────────┘\n\n';
txt+='◆ EXTRAS (+$300 c/u) ─────────────────────────────────────────────────\n';
txt+=`${extrasMap['Ropa COLOR']?'☒':'☐'} Ropa COLOR ${extrasMap['Perfume']?'☒':'☐'} Perfume\n`;
txt+=`${extrasMap['Ropa BLANCA']?'☒':'☐'} Ropa BLANCA ${extrasMap['Perla Olor']?'☒':'☐'} Perla Olor\n`;
txt+=`${extrasMap['Ropa OSCURA']?'☒':'☐'} Ropa OSCURA ${extrasMap['Fragancia']?'☒':'☐'} Fragancia\n`;
txt+='   ▶ Más suave y mejor aroma\n\n';
txt+='▸ DESCRIPCIÓN ────────────────────────────────────────────────────────\n';
txt+='  Económico → Lavado + Centrifugado + Doblado\n  Básico    → Detergente líquido + Suavizante\n';
txt+='  Premium   → Cápsulas + Fragancia (Ropa)\n  Especial  → Cápsulas + Fragancia (Sábanas / Toallas)\n\n';
txt+='▸ ESTADO DE LA ROPA ──────────────────────────────────────────────────\n';
txt+=`${estadoRopa==='Sucia (+$400)'?'☒':'☐'} Sucia (+$400) ${estadoRopa==='Semisucia (+$200)'?'☒':'☐'} Semisucia (+$200)\n\n`;
txt+='▸ PRENDAS (Tipo / Cantidad / Peso) ───────────────────────────────────\n';
txt+=`${prendas||'____________________________________________________'}\n\n`;
txt+='▸ PLANCHADO (por prenda) ─────────────────────────────────────────────\n';
txt+=`${planchadoTexto||'____________________________________________________'}\n\n`;
txt+='▸ MENSAJERÍA ─────────────────────────────────────────────────────────\n';
txt+=`${msgRecogida?'☒':'☐'} Recogida ${msgEntrega?'☒':'☐'} Entrega\n`;
txt+=`Dirección: ${direccionMensajeria||'__________________________________________'}\n\n`;txt+='▸ COBRO ──────────────────────────────────────────────────────────────\n';
txt+=`Servicio $ ${servicioMonto}\n Extras $ ${extrasMonto}\n Estado ropa $ ${estadoMonto}\n`;
txt+=`Planchado $ ${costoPlanchado}\n Mensajería $ ${mensajeriaMonto}\n ──────────────────────\n`;
txt+=`TOTAL $ ${total}\n Recibido $ ${recibido}\n Cambio $ ${cambio>=0?cambio:'0 (falta)'}\n\n`;
txt+='▸ FIRMAS ─────────────────────────────────────────────────────────────\n';
txt+=`Cliente: ${firmaCliente}\n Encargado: ${firmaEncargado}\n\n`;
txt+='▸ PIEZAS ─────────────────────────────────────────────────────────────\n';
txt+='  P-KG   DP   DL   S   Fragancia   Perfume\n  ─────────────────────────────────────────\n'; 
txt+=`${piezasTexto||'____________________________________________________'}\n\n`;
txt+='============================================\nDocumento generado por Lavandería EKO\n============================================';
return txt;
}
function descargarTXT(){
const ordenNo=getVal('ordenNo')||generarNumeroOrden();
const txt=generarTXT();
const blob=new Blob([txt],{type:'text/plain'});
const a=document.createElement('a');
a.href=URL.createObjectURL(blob);
a.download=`orden_${ordenNo}.txt`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(a.href);
showToast('✅ Archivo TXT descargado');
}
function previsualizarTXT(){
const txt=generarTXT();
const previewModal=document.createElement('div');
previewModal.id='previewModal';
previewModal.style.position='fixed';previewModal.style.top='0';previewModal.style.left='0';
previewModal.style.width='100%';previewModal.style.height='100%';previewModal.style.backgroundColor='rgba(0,0,0,0.8)';
previewModal.style.zIndex='10000';previewModal.style.display='flex';previewModal.style.justifyContent='center';previewModal.style.alignItems='center';
const content=document.createElement('div');
content.style.backgroundColor='white';content.style.padding='20px';content.style.borderRadius='10px';
content.style.maxWidth='90%';content.style.maxHeight='90%';content.style.overflow='auto';
content.innerHTML=`<h3>Previsualización del TXT</h3><pre style="font-family:monospace; white-space:pre-wrap;">${txt.replace(/[&<>]/g,function(m){if(m==='&')return '&amp;';if(m==='<')return '&lt;';if(m==='>')return '&gt;';return m;})}</pre><button id="closePreviewBtn">Cerrar</button>`;
previewModal.appendChild(content);
document.body.appendChild(previewModal);
document.getElementById('closePreviewBtn').onclick=()=>previewModal.remove();
}
function guardarBorrador(){const formData={};const inputs=document.querySelectorAll('#adminForm input, #adminForm select, #adminForm textarea');inputs.forEach(inp=>{if(inp.type==='checkbox')formData[inp.id]=inp.checked;else if(inp.type==='radio'){if(inp.checked)formData[inp.name]=inp.value;}else formData[inp.id]=inp.value;});localStorage.setItem('eko_borrador_formulario',JSON.stringify(formData));}
function cargarBorrador(){const borrador=localStorage.getItem('eko_borrador_formulario');if(!borrador)return;const data=JSON.parse(borrador);for(let[id,val]of Object.entries(data)){const el=document.getElementById(id);if(el){if(el.type==='checkbox')el.checked=val;else if(el.type==='radio'){const radio=document.querySelector(`input[name="${id}"][value="${val}"]`);if(radio)radio.checked=true;}else el.value=val;}}actualizarTotales();showToast('💾 Borrador restaurado');}
function limpiarFormulario(){if(confirm('¿Limpiar todo el formulario actual?')){const form=document.getElementById('adminForm');form.querySelectorAll('input, select, textarea').forEach(el=>{if(el.type==='checkbox'||el.type==='radio')el.checked=false;else el.value='';});document.getElementById('ropaLimpia').checked=true;actualizarTotales();showToast('🧹 Formulario limpio');}}
function construirFormulario(){
const adminForm=document.getElementById('adminForm');
if(!adminForm)return;
adminForm.innerHTML=`
<div class="admin-section"><h4>📋 Datos del Cliente</h4>
<div class="admin-grid">
<div class="form-group"><label>N° Orden</label><input type="text" id="ordenNo" placeholder="Dejar vacío para auto-generar"></div><div class="form-group"><label>Cliente</label><input type="text" id="clienteNombre" placeholder="Nombre completo" autocomplete="off"></div>
<div class="form-group"><label>Teléfono</label><input type="tel" id="adminTelefono" placeholder="Ej: 555-1234"></div>
<div class="form-group"><label>Fecha Recepción</label><input type="date" id="fechaRecepcion"></div>
<div class="form-group"><label>Fecha Entrega</label><input type="date" id="fechaEntrega"></div>
<div class="form-group"><label>Dirección</label><input type="text" id="adminDireccion" placeholder="Calle, número, colonia"></div>
<div class="form-group"><label>Zona mensajería</label><select id="domicilioZona"><option value="Zona Corta $600">Zona Corta ($600)</option><option value="Zona Media $900">Zona Media ($900)</option><option value="Zona Larga $1200">Zona Larga ($1200)</option></select></div>
</div></div>
<div class="admin-section"><h4>🧺 Servicio por carga</h4>
<div class="admin-grid">
<div class="form-group"><label>Peso</label><select id="pesoRango"><option value="1-2">1–2 kg</option><option value="3-4">3–4 kg</option><option value="5-6">5–6 kg</option><option value="7">7 kg</option></select></div>
<div class="form-group"><label>Tipo</label><select id="tipoServicio"><option value="Economico">Económico</option><option value="Basico">Básico</option><option value="Premium">Premium</option><option value="Especial">Especial</option></select></div>
</div></div>
<div class="admin-section"><h4>✨ Extras (+$300 c/u)</h4><div class="checkbox-group">
<label><input type="checkbox" id="extraColor"> Ropa COLOR</label>  <label><input type="checkbox" id="extraBlanca"> Ropa BLANCA</label>
<label><input type="checkbox" id="extraOscura"> Ropa OSCURA</label>  <label><input type="checkbox" id="extraPerfume"> Perfume</label>
<label><input type="checkbox" id="extraPerla"> Perla Olor</label>  <label><input type="checkbox" id="extraFragancia"> Fragancia</label>
</div></div>
<div class="admin-section"><h4>🧼 Estado de la ropa</h4><div class="radio-group">
<label><input type="radio" name="estadoRopa" id="ropaSucia"> Sucia (+$400)</label>
<label><input type="radio" name="estadoRopa" id="ropaSemisucia"> Semisucia (+$200)</label>
<label><input type="radio" name="estadoRopa" id="ropaLimpia" checked> Limpia (sin extra)</label>
</div></div>
<div class="admin-section"><h4>📝 Prendas</h4><textarea id="prendas" rows="2" placeholder="Ej: Camisas x3 - 1.5kg, Pantalones x2 - 1kg"></textarea></div>
<div class="admin-section"><h4>👕 Planchado</h4><div class="admin-grid">
<div class="form-group"><label>Descripción</label><input type="text" id="planchadoTexto" placeholder="Ej: 5 camisas, 3 pantalones"></div>
<div class="form-group"><label>Costo ($)</label><input type="number" id="costoPlanchado" value="0" step="100"></div>
</div></div>
<div class="admin-section"><h4>🚚 Mensajería</h4><div class="checkbox-group">
<label><input type="checkbox" id="msgRecogida"> Recogida</label>  <label><input type="checkbox" id="msgEntrega"> Entrega</label>
</div><div class="form-group"><input type="text" id="direccionMensajeria" placeholder="Dirección para mensajería"></div></div>
<div class="admin-section"><h4>💰 Cobro</h4><div class="totales-grid">
<div>Servicio:  <span id="servicioMonto">$0</span></div><div>Extras:  <span id="extrasMonto">$0</span></div>
<div>Estado ropa:  <span id="estadoRopaMonto">$0</span></div><div>Planchado:  <span id="planchadoMonto">$0</span></div>
<div>Mensajería:  <span id="mensajeriaMonto">$0</span></div><div><strong>TOTAL:  <span id="totalGeneral">$0</span></strong></div>
</div><div class="admin-grid">
<div class="form-group"><label>Recibido ($)</label><input type="number" id="pagoRecibido" value="0" step="100"></div>
<div class="form-group"><label>Cambio</label><span id="cambioMonto">$0</span></div>
</div><input type="hidden" id="pagoTotal"></div>
<div class="admin-section"><h4>✍️ Firmas</h4><div class="admin-grid">
<div class="form-group"><label>Encargado</label><input type="text" id="firmaEncargado" placeholder="Nombre del encargado"></div>
<div class="form-group"><label>Cliente</label><input type="text" id="firmaCliente" placeholder="Nombre del cliente"></div>
</div></div>
<div class="admin-section"><h4>🔧 Piezas</h4><textarea id="piezasTexto" rows="2" placeholder="Ej: 5kg  2  1  0  Sí  No"></textarea></div>
<div class="modal-buttons">
<button type="button" id="guardarHistorialBtn" class="btn-modal">📀 Guardar en historial</button>
<button type="button" id="previsualizarBtn" class="btn-modal">👁️ Previsualizar TXT</button>
<button type="button" id="descargarTxtBtn" class="btn-modal btn-enviar">⬇️ Descargar TXT</button>
<button type="button" id="limpiarFormBtn" class="btn-modal">🧹 Limpiar formulario</button>
<button type="button" id="cargarBorradorBtn" class="btn-modal">💾 Restaurar borrador</button>
</div>`;const hoy=new Date().toISOString().split('T')[0];
const entrega=new Date(Date.now()+2*86400000).toISOString().split('T')[0];
if(!getVal('fechaRecepcion'))setVal('fechaRecepcion',hoy);
if(!getVal('fechaEntrega'))setVal('fechaEntrega',entrega);
setupAutocomplete('clienteNombre','clienteNombre');
setupAutocomplete('adminDireccion','direccion');
setupAutocomplete('adminTelefono','telefono');
document.getElementById('clienteNombre')?.addEventListener('blur',autoCompletarCliente);
document.getElementById('adminDireccion')?.addEventListener('blur',sugerirZonaPorDireccion);
const eventos=['pesoRango','tipoServicio','extraColor','extraBlanca','extraOscura','extraPerfume','extraPerla','extraFragancia','ropaSucia','ropaSemisucia','domicilioZona','costoPlanchado','pagoRecibido'];
eventos.forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('change',()=>{actualizarTotales();guardarBorrador();});});
document.getElementById('costoPlanchado')?.addEventListener('input',()=>{actualizarTotales();guardarBorrador();});
document.getElementById('pagoRecibido')?.addEventListener('input',actualizarTotales);
document.getElementById('descargarTxtBtn')?.addEventListener('click',descargarTXT);
document.getElementById('guardarHistorialBtn')?.addEventListener('click',()=>{
const ordenData={ordenNo:getVal('ordenNo')||generarNumeroOrden(),clienteNombre:getVal('clienteNombre'),telefono:getVal('adminTelefono'),fechaRecepcion:getVal('fechaRecepcion'),fechaEntrega:getVal('fechaEntrega'),direccion:getVal('adminDireccion'),zonaMensajeria:getVal('domicilioZona'),pesoRango:getVal('pesoRango'),tipoServicio:getVal('tipoServicio'),extras:{extraColor:getCheckboxVal('extraColor'),extraBlanca:getCheckboxVal('extraBlanca'),extraOscura:getCheckboxVal('extraOscura'),extraPerfume:getCheckboxVal('extraPerfume'),extraPerla:getCheckboxVal('extraPerla'),extraFragancia:getCheckboxVal('extraFragancia')},ropaSucia:getCheckboxVal('ropaSucia'),ropaSemisucia:getCheckboxVal('ropaSemisucia'),prendas:getVal('prendas'),planchadoTexto:getVal('planchadoTexto'),costoPlanchado:parseFloat(getVal('costoPlanchado','0')),msgRecogida:getCheckboxVal('msgRecogida'),msgEntrega:getCheckboxVal('msgEntrega'),direccionMensajeria:getVal('direccionMensajeria'),pagoRecibido:parseFloat(getVal('pagoRecibido','0')),firmaEncargado:getVal('firmaEncargado'),firmaCliente:getVal('firmaCliente'),piezasTexto:getVal('piezasTexto')};
guardarOrdenEnHistorial(ordenData);guardarBorrador();});
document.getElementById('previsualizarBtn')?.addEventListener('click',previsualizarTXT);
document.getElementById('limpiarFormBtn')?.addEventListener('click',limpiarFormulario);
document.getElementById('cargarBorradorBtn')?.addEventListener('click',cargarBorrador);
actualizarTotales();
cargarBorrador();
if(autoSaveInterval)clearInterval(autoSaveInterval);
autoSaveInterval=setInterval(guardarBorrador,30000);
}
function mostrarHistorial(){
const historial=obtenerHistorialCompleto();
const container=document.getElementById('historialContainer');
if(!container)return;
let html=`<h3>📜 Órdenes de servicio guardadas</h3><input type="text" id="buscarHistorial" placeholder="🔍 Buscar por orden, cliente o teléfono..." style="width:100%; padding:8px; margin-bottom:10px;"><div id="listaHistorial"></div>`;
container.innerHTML=html;
const buscarInput=document.getElementById('buscarHistorial');
const listaDiv=document.getElementById('listaHistorial');
function renderLista(filtro=''){
const filtrado=historial.filter(ord=>ord.ordenNo?.toLowerCase().includes(filtro)||ord.clienteNombre?.toLowerCase().includes(filtro)||ord.telefono?.includes(filtro));
if(filtrado.length===0)listaDiv.innerHTML='<p>No hay órdenes coincidentes.</p>';
else{listaDiv.innerHTML=filtrado.map((ord,idx)=>`<div class="historial-item" style="border-bottom:1px solid #ccc; padding:8px;"><strong>#${ord.ordenNo||'N/A'}</strong> - ${new Date(ord.fechaRegistro).toLocaleString()}<br>Cliente: ${ord.clienteNombre||'?'} | Tel: ${ord.telefono||'?'}<br>Total: $${(ord.costoPlanchado||0)+(ord.extras?Object.values(ord.extras).filter(Boolean).length*300:0)}<br><button class="btn-cargar" data-idx="${idx}">📂 Cargar</button>  <button class="btn-eliminar" data-idx="${idx}">🗑️ Eliminar</button></div>`).join('');
document.querySelectorAll('.btn-cargar').forEach(btn=>{btn.addEventListener('click',(e)=>{const idx=btn.getAttribute('data-idx');cargarOrdenEnFormulario(historial[parseInt(idx)]);window.cerrarModal(historialModal);});});
document.querySelectorAll('.btn-eliminar').forEach(btn=>{btn.addEventListener('click',(e)=>{const idx=btn.getAttribute('data-idx');if(confirm('¿Eliminar esta orden del historial?'))eliminarOrdenDelHistorial(parseInt(idx));});});}}
renderLista();
buscarInput.addEventListener('input',()=>renderLista(buscarInput.value.toLowerCase()));
if(typeof window.obtenerHistorial==='function'){const antiguo=window.obtenerHistorial();if(antiguo.reservas?.length||antiguo.comentarios?.length){listaDiv.innerHTML+='<hr><h4>Reservas antiguas</h4>';antiguo.reservas.forEach(r=>listaDiv.innerHTML+=`<div>Reserva: ${r.cliente.nombre} - $${r.total}</div>`);listaDiv.innerHTML+='<h4>Comentarios antiguos</h4>';antiguo.comentarios.forEach(c=>listaDiv.innerHTML+=`<div>${c.nombre}: ${c.mensaje}</div>`);}}
window.abrirModal(historialModal);
}
function init(){
construirFormulario();
window.addEventListener('keydown',(e)=>{if(e.ctrlKey&&e.key==='g'){e.preventDefault();document.getElementById('guardarHistorialBtn')?.click();}if(e.ctrlKey&&e.key==='d'){e.preventDefault();document.getElementById('descargarTxtBtn')?.click();}if(e.ctrlKey&&e.key==='l'){e.preventDefault();document.getElementById('limpiarFormBtn')?.click();}if(e.ctrlKey&&e.key==='h'){e.preventDefault();mostrarHistorial();}});
if(validarBtn){validarBtn.addEventListener('click',()=>{const ahora=Date.now();if(ahora<blockedUntil){showToast(`Demasiados intentos. Espere ${Math.ceil((blockedUntil-ahora)/1000)}s`,true);return;}const clave=document.getElementById('claveAcceso').value;if(clave===ADMIN_PASSWORD){adminAttempts=0;window.cerrarModal(claveModal);window.abrirModal(adminModal);document.getElementById('claveAcceso').value='';}else{adminAttempts++;showToast(`Clave incorrecta. Intento ${adminAttempts}/${MAX_ATTEMPTS}`,true);if(adminAttempts>=MAX_ATTEMPTS){blockedUntil=Date.now()+BLOCK_TIME;adminAttempts=0;showToast('Bloqueado 30 segundos',true);}document.getElementById('claveAcceso').value='';}});}
if(verHistorialBtn)verHistorialBtn.addEventListener('click',mostrarHistorial);
if(limpiarHistorialBtn){limpiarHistorialBtn.addEventListener('click',()=>{if(confirm('¿Eliminar TODO el historial de órdenes?')){limpiarHistorialCompleto();if(typeof window.limpiarHistorial==='function')window.limpiarHistorial();const container=document.getElementById('historialContainer');if(container)container.innerHTML='<p>Historial vacío.</p>';window.cerrarModal(historialModal);}});}}
init();
})();