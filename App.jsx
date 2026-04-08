import React from 'react'

const summaryCards = [
  { label: 'Notas recebidas', value: '1.284', trend: '+8,2% mês', color: 'from-blue-500 to-cyan-500' },
  { label: 'Boletos processados', value: '913', trend: '+5,1% mês', color: 'from-violet-500 to-fuchsia-500' },
  { label: 'Total financeiro NF', value: 'R$ 12,8M', trend: '+11,4% mês', color: 'from-emerald-500 to-teal-500' },
  { label: 'Conformidade', value: '96,7%', trend: 'Meta: 98%', color: 'from-amber-500 to-orange-500' }
]

const statusPipeline = [
  { status: 'Pendente', count: 132, bar: 'w-1/5', color: 'bg-slate-400' },
  { status: 'Processado', count: 427, bar: 'w-2/5', color: 'bg-blue-500' },
  { status: 'Conciliado', count: 598, bar: 'w-4/5', color: 'bg-emerald-500' },
  { status: 'Divergente', count: 94, bar: 'w-1/4', color: 'bg-rose-500' },
  { status: 'Corrigido', count: 33, bar: 'w-1/6', color: 'bg-violet-500' }
]

const divergences = [
  { doc: 'NF 87231', type: 'Item duplicado', expected: 'R$ 15.300,00', current: 'R$ 15.980,00', supplier: 'Norte Distribuição' },
  { doc: 'NF 87554', type: 'ICMS divergente', expected: 'R$ 89,10', current: 'R$ 70,34', supplier: 'Alpha Insumos' },
  { doc: 'NF 87902', type: 'Quantidade divergente', expected: '340 un', current: '380 un', supplier: 'Sigma Logística' }
]

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">ReqSAP Intelligence</p>
            <h1 className="text-2xl font-semibold">Conciliação Fiscal & Financeira</h1>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">UPLOAD</button>
            <button className="rounded-xl border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/10">DOWNLOAD</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-12">
        <section className="lg:col-span-9">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article key={card.label} className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-lg shadow-black/20">
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-bold">{card.value}</p>
                <div className={`mt-3 h-1.5 rounded-full bg-gradient-to-r ${card.color}`} />
                <p className="mt-2 text-xs text-slate-300">{card.trend}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900 p-5 xl:col-span-2">
              <h2 className="text-lg font-semibold">Pipeline operacional</h2>
              <p className="mt-1 text-sm text-slate-400">Visão por status das notas no ciclo de processamento.</p>
              <div className="mt-5 space-y-4">
                {statusPipeline.map((item) => (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.status}</span>
                      <span className="text-slate-300">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full ${item.color} ${item.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Alertas inteligentes</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="rounded-xl bg-rose-500/10 p-3 text-rose-200">7 divergências críticas acima de R$ 50 mil.</li>
                <li className="rounded-xl bg-amber-500/10 p-3 text-amber-100">12 notas aguardando validação humana.</li>
                <li className="rounded-xl bg-cyan-500/10 p-3 text-cyan-100">OCR de XML acima de 99% de acurácia hoje.</li>
              </ul>
            </article>
          </div>

          <article className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Divergências recentes</h2>
              <input
                placeholder="Buscar por fornecedor, NF, tipo..."
                className="w-72 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:ring"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Documento</th>
                    <th className="pb-3 font-medium">Fornecedor</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Esperado</th>
                    <th className="pb-3 font-medium">Encontrado</th>
                    <th className="pb-3 font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {divergences.map((row) => (
                    <tr key={row.doc} className="border-t border-white/5">
                      <td className="py-3 font-medium">{row.doc}</td>
                      <td className="py-3">{row.supplier}</td>
                      <td className="py-3 text-rose-300">{row.type}</td>
                      <td className="py-3">{row.expected}</td>
                      <td className="py-3">{row.current}</td>
                      <td className="py-3">
                        <button className="rounded-lg bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/30">Corrigir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside className="space-y-6 lg:col-span-3">
          <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Upload inteligente</h2>
            <p className="mt-2 text-sm text-slate-400">Arraste PDF, XML, imagem ou planilha. O motor processa em fila assíncrona.</p>
            <button className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Selecionar arquivos</button>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Conciliação</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Notas x Boleto</dt><dd className="text-emerald-300">97,1%</dd></div>
              <div className="flex justify-between"><dt>Notas x Espelho</dt><dd className="text-amber-300">94,3%</dd></div>
              <div className="flex justify-between"><dt>Reprocessamento</dt><dd className="text-cyan-300">23 casos</dd></div>
            </dl>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Auditoria</h2>
            <p className="mt-2 text-sm text-slate-400">Última correção manual por analista financeiro em NF 87902 às 14:32.</p>
          </article>
        </aside>
      </main>
    </div>
  )
}

export default App
