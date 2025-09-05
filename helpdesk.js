; (function () {
  const script =
    document.currentScript ||
    (function () {
      const s = document.getElementsByTagName('script')
      return s[s.length - 1]
    })()

  const title = script.getAttribute('data-hd-title') || 'Support'
  const tenant = script.getAttribute('data-hd-tenant') || null
  const apiBase = script.getAttribute('data-hd-api') || null

  const css = `
  .hd-bubble{position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;box-shadow:0 6px 18px rgba(38,99,235,.25);z-index:2147483646}
  .hd-panel{position:fixed;right:24px;bottom:96px;width:320px;max-width:calc(100% - 48px);z-index:2147483646}
  .hd-panel .hd-card{background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,.2);overflow:hidden;display:flex;flex-direction:column;height:420px}
  .hd-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee;font-weight:600}
  .hd-messages{padding:12px;overflow:auto;flex:1;display:flex;flex-direction:column;gap:8px}
  .hd-msg{padding:8px 12px;border-radius:12px;max-width:80%}
  .hd-msg.agent{background:#f1f5f9;color:#0f172a;align-self:flex-start}
  .hd-msg.user{background:#2563eb;color:#fff;align-self:flex-end}
  .hd-form{display:flex;gap:8px;padding:12px;border-top:1px solid #eee}
  .hd-input{flex:1;padding:8px 10px;border-radius:8px;border:1px solid #e6eef8}
  .hd-send{background:#2563eb;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
  .hd-close{background:transparent;border:0;font-size:20px;line-height:1;cursor:pointer}
  `

  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)

  const bubble = document.createElement('button')
  bubble.className = 'hd-bubble'
  bubble.setAttribute('aria-label', title)
  bubble.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s-7-4.35-9-7.5S2 6 12 6s9 8.5 9 8.5S19 22 12 22z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  const panelWrap = document.createElement('div')
  panelWrap.className = 'hd-panel'
  panelWrap.style.display = 'none'
  panelWrap.innerHTML = `
    <div class="hd-card" role="dialog" aria-label="${escapeHtml(title)}">
      <div class="hd-header"><span>${escapeHtml(title)}</span><button class="hd-close" aria-label="Close">×</button></div>
      <div class="hd-messages"></div>
      <form class="hd-form"><input class="hd-input" placeholder="Type a message..." /><button class="hd-send" type="submit">Send</button></form>
    </div>
  `

  document.body.appendChild(bubble)
  document.body.appendChild(panelWrap)

  const messagesEl = panelWrap.querySelector('.hd-messages')
  const inputEl = panelWrap.querySelector('.hd-input')
  const formEl = panelWrap.querySelector('.hd-form')
  const closeBtn = panelWrap.querySelector('.hd-close')

  pushMessage('agent', 'Hi — how can I help you today?')

  function toggle() {
    const open = panelWrap.style.display !== 'none'
    panelWrap.style.display = open ? 'none' : 'block'
  }
  function close() {
    panelWrap.style.display = 'none'
  }

  bubble.addEventListener('click', toggle)
  closeBtn.addEventListener('click', close)
  panelWrap.addEventListener('click', function (e) {
    if (e.target === panelWrap) close()
  })

  formEl.addEventListener('submit', function (e) {
    e.preventDefault()
    const text = inputEl.value.trim()
    if (!text) return
    pushMessage('user', text)
    inputEl.value = ''
    if (apiBase && tenant) {
      fetch(`${apiBase.replace(/\/$/, '')}/tenants/${tenant}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'user', text }),
      }).catch((err) => console.error('chat save failed', err))
    }
    setTimeout(() => {
      pushMessage('agent', 'Thanks — we received your message and will respond shortly.')
    }, 700)
  })

  function pushMessage(from, text) {
    if (!messagesEl) return
    const el = document.createElement('div')
    el.className = 'hd-msg ' + from
    el.textContent = text
    messagesEl.appendChild(el)
    messagesEl.scrollTop = messagesEl.scrollHeight
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
    })
  }
})()
