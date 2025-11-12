import './styles.css'
import logoUrl from './assets/logo.jpg'

document.querySelector('#app').innerHTML = `
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    
    <h1 class="text-3xl font-bold text-blue-600">SkillSling</h1>
    <p class="text-gray-700 mt-1 text-sm">Find and hire trusted service providers</p>
    <img src="${logoUrl}" alt="SkillSling Logo" class="w-10 h-10 mb-3 rounded-full shadow-sm border border-gray-300" />
  </div>
`





