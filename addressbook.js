// 存储联系人数据
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
let showOnlyBookmarks = false;

// DOM元素
const contactForm = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const phoneContainer = document.getElementById('phone-container');
const addPhoneBtn = document.getElementById('add-phone');
const emailContainer = document.getElementById('email-container');
const addEmailBtn = document.getElementById('add-email');
const contactList = document.getElementById('contact-list');
const bookmarkFilterBtn = document.getElementById('bookmark-filter');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');

// 初始化应用
function init() {
    renderContactList();
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 表单提交
    contactForm.addEventListener('submit', handleSubmit);
    
    // 添加电话号码
    addPhoneBtn.addEventListener('click', addPhoneInput);
    
    // 添加电子邮件
    addEmailBtn.addEventListener('click', addEmailInput);
    
    // 书签筛选
    bookmarkFilterBtn.addEventListener('click', toggleBookmarkFilter);
    
    // 导出联系人
    exportBtn.addEventListener('click', exportContacts);
    
    // 导入联系人
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', handleImport);
    
    // 动态移除电话号码和电子邮件输入框
    phoneContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            removeInput(e.target.closest('.input-group'), 'phone');
        }
    });
    
    emailContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            removeInput(e.target.closest('.input-group'), 'email');
        }
    });
}

// 添加电话号码输入框
function addPhoneInput() {
    const inputGroup = createInputGroup('phone');
    phoneContainer.appendChild(inputGroup);
    updateRemoveButtons('phone');
}

// 添加电子邮件输入框
function addEmailInput() {
    const inputGroup = createInputGroup('email');
    emailContainer.appendChild(inputGroup);
    updateRemoveButtons('email');
}

// 创建输入组
function createInputGroup(type) {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    
    const input = document.createElement('input');
    input.type = type === 'phone' ? 'tel' : 'email';
    input.className = type + '-input';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(removeBtn);
    
    return inputGroup;
}

// 移除输入框
function removeInput(inputGroup, type) {
    const container = type === 'phone' ? phoneContainer : emailContainer;
    if (container.children.length > 1) {
        inputGroup.remove();
        updateRemoveButtons(type);
    }
}

// 更新移除按钮状态
function updateRemoveButtons(type) {
    const container = type === 'phone' ? phoneContainer : emailContainer;
    const removeBtns = container.querySelectorAll('.remove-btn');
    removeBtns.forEach((btn, index) => {
        btn.disabled = index === 0 && removeBtns.length === 1;
    });
}

// 处理表单提交
function handleSubmit(e) {
    e.preventDefault();
    
    // 收集电话号码
    const phones = Array.from(document.querySelectorAll('.phone-input'))
        .map(input => input.value.trim())
        .filter(phone => phone);
    
    // 收集电子邮件
    const emails = Array.from(document.querySelectorAll('.email-input'))
        .map(input => input.value.trim())
        .filter(email => email);
    
    // 创建新联系人
    const newContact = {
        id: Date.now(),
        name: nameInput.value.trim(),
        phones: phones,
        emails: emails,
        social: document.getElementById('social').value.trim(),
        address: document.getElementById('address').value.trim(),
        bookmarked: false
    };
    
    // 添加到联系人列表
    contacts.push(newContact);
    saveContacts();
    renderContactList();
    contactForm.reset();
    
    // 重置输入框到初始状态
    resetInputContainers();
}

// 重置输入框容器
function resetInputContainers() {
    // 重置电话号码
    phoneContainer.innerHTML = '';
    phoneContainer.appendChild(createInputGroup('phone'));
    
    // 重置电子邮件
    emailContainer.innerHTML = '';
    emailContainer.appendChild(createInputGroup('email'));
    
    updateRemoveButtons('phone');
    updateRemoveButtons('email');
}

// 渲染联系人列表
function renderContactList() {
    contactList.innerHTML = '';
    
    const filteredContacts = showOnlyBookmarks 
        ? contacts.filter(contact => contact.bookmarked)
        : contacts;
    
    // 按书签和姓名排序
    filteredContacts.sort((a, b) => {
        if (a.bookmarked !== b.bookmarked) {
            return b.bookmarked ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
    });
    
    filteredContacts.forEach(contact => {
        contactList.appendChild(createContactCard(contact));
    });
}

// 创建联系人卡片
function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = `contact-card ${contact.bookmarked ? 'bookmarked' : ''}`;
    card.innerHTML = `
        <div class="contact-header">
            <h3 class="contact-name">${contact.name}</h3>
            <button class="bookmark-btn ${contact.bookmarked ? 'bookmarked' : ''}" 
                    data-id="${contact.id}">
                ★
            </button>
        </div>
        <div class="contact-info">
            ${contact.phones.length > 0 ? 
                `<p><strong>电话:</strong> ${contact.phones.join(', ')}</p>` : ''}
            ${contact.emails.length > 0 ? 
                `<p><strong>邮箱:</strong> ${contact.emails.join(', ')}</p>` : ''}
            ${contact.social ? 
                `<p><strong>社交媒体:</strong> ${contact.social}</p>` : ''}
            ${contact.address ? 
                `<p><strong>地址:</strong> ${contact.address}</p>` : ''}
        </div>
        <div class="contact-actions">
            <button class="delete-btn" data-id="${contact.id}">删除</button>
        </div>
    `;
    
    // 添加书签事件
    card.querySelector('.bookmark-btn').addEventListener('click', () => {
        toggleBookmark(contact.id);
    });
    
    // 添加删除事件
    card.querySelector('.delete-btn').addEventListener('click', () => {
        deleteContact(contact.id);
    });
    
    return card;
}

// 切换书签状态
function toggleBookmark(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        contact.bookmarked = !contact.bookmarked;
        saveContacts();
        renderContactList();
    }
}

// 删除联系人
function deleteContact(id) {
    if (confirm('确定要删除这个联系人吗？')) {
        contacts = contacts.filter(c => c.id !== id);
        saveContacts();
        renderContactList();
    }
}

// 切换书签筛选
function toggleBookmarkFilter() {
    showOnlyBookmarks = !showOnlyBookmarks;
    bookmarkFilterBtn.classList.toggle('active', showOnlyBookmarks);
    renderContactList();
}

// 导出联系人
function exportContacts() {
    if (contacts.length === 0) {
        alert('没有联系人可以导出');
        return;
    }
    
    // 创建CSV内容
    const headers = ['姓名', '电话号码', '电子邮件', '社交媒体账号', '地址', '是否书签'];
    const csvContent = [
        headers.join(','),
        ...contacts.map(contact => [
            contact.name,
            contact.phones.join(';'),
            contact.emails.join(';'),
            contact.social,
            contact.address.replace(/\n/g, ' '),
            contact.bookmarked ? '是' : '否'
        ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 处理导入
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        parseAndImportCSV(csvContent);
    };
    reader.readAsText(file);
    
    // 重置文件输入
    event.target.value = '';
}

// 解析并导入CSV
function parseAndImportCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        alert('CSV文件格式不正确或没有联系人数据');
        return;
    }
    
    // 跳过表头
    const newContacts = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // 使用正则表达式解析CSV行，处理包含逗号的字段
        const fields = line.match(/"([^"]*)"|([^,]+)/g).map(field => {
            return field.replace(/^"|"$/g, '').trim();
        });
        
        if (fields.length >= 1 && fields[0]) {
            newContacts.push({
                id: Date.now() + i,
                name: fields[0],
                phones: fields[1] ? fields[1].split(';') : [],
                emails: fields[2] ? fields[2].split(';') : [],
                social: fields[3] || '',
                address: fields[4] || '',
                bookmarked: fields[5] === '是'
            });
        }
    }
    
    if (newContacts.length > 0) {
        contacts = [...contacts, ...newContacts];
        saveContacts();
        renderContactList();
        alert(`成功导入 ${newContacts.length} 个联系人`);
    } else {
        alert('没有找到有效的联系人数据');
    }
}

// 保存联系人到本地存储
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// 启动应用
init();