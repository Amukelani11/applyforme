const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAIAnalysis() {
  try {
    console.log('🧪 Testing AI Analysis Service...\n')

    // Test 1: Check if we have any users
    console.log('1. Checking for users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .limit(5)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found. Please create some users first.')
      return
    }

    console.log(`✅ Found ${users.length} users`)
    const testUser = users[0]
    console.log(`   Testing with user: ${testUser.full_name} (${testUser.email})\n`)

    // Test 2: Check if we have job postings
    console.log('2. Checking for job postings...')
    const { data: jobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('id, title, company, is_active')
      .eq('is_active', true)
      .limit(5)

    if (jobsError) {
      console.error('❌ Error fetching job postings:', jobsError)
      return
    }

    if (!jobs || jobs.length === 0) {
      console.log('⚠️  No active job postings found. Please add some job postings first.')
      return
    }

    console.log(`✅ Found ${jobs.length} active job postings`)
    jobs.forEach(job => {
      console.log(`   - ${job.title} at ${job.company}`)
    })
    console.log()

    // Test 3: Check user's work experience
    console.log('3. Checking user work experience...')
    const { data: workExp, error: workError } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', testUser.id)

    if (workError) {
      console.error('❌ Error fetching work experience:', workError)
      return
    }

    console.log(`✅ Found ${workExp?.length || 0} work experience entries`)
    if (workExp && workExp.length > 0) {
      workExp.forEach(exp => {
        console.log(`   - ${exp.title} at ${exp.company}`)
      })
    }
    console.log()

    // Test 4: Check user's education
    console.log('4. Checking user education...')
    const { data: education, error: eduError } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', testUser.id)

    if (eduError) {
      console.error('❌ Error fetching education:', eduError)
      return
    }

    console.log(`✅ Found ${education?.length || 0} education entries`)
    if (education && education.length > 0) {
      education.forEach(edu => {
        console.log(`   - ${edu.degree} in ${edu.field_of_study} from ${edu.institution}`)
      })
    }
    console.log()

    // Test 5: Check user's certifications
    console.log('5. Checking user certifications...')
    const { data: certs, error: certError } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', testUser.id)

    if (certError) {
      console.error('❌ Error fetching certifications:', certError)
      return
    }

    console.log(`✅ Found ${certs?.length || 0} certifications`)
    if (certs && certs.length > 0) {
      certs.forEach(cert => {
        console.log(`   - ${cert.name} from ${cert.issuer}`)
      })
    }
    console.log()

    // Test 6: Check user's documents (CV)
    console.log('6. Checking user documents...')
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('document_type', 'cv')

    if (docsError) {
      console.error('❌ Error fetching documents:', docsError)
      return
    }

    console.log(`✅ Found ${docs?.length || 0} CV documents`)
    if (docs && docs.length > 0) {
      docs.forEach(doc => {
        console.log(`   - CV: ${doc.file_url}`)
      })
    }
    console.log()

    // Test 7: Simulate AI analysis
    console.log('7. Simulating AI analysis...')
    
    // Calculate total experience
    let totalExperience = 0
    if (workExp && workExp.length > 0) {
      totalExperience = workExp.reduce((total, exp) => {
        const start = new Date(exp.start_date)
        const end = exp.is_current ? new Date() : new Date(exp.end_date || '')
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
      }, 0)
    }

    // Extract skills
    const skills = new Set()
    if (workExp && workExp.length > 0) {
      workExp.forEach(exp => {
        const title = exp.title.toLowerCase()
        const description = exp.description.toLowerCase()
        
        if (title.includes('developer') || description.includes('developer')) skills.add('Software Development')
        if (title.includes('manager') || description.includes('manager')) skills.add('Management')
        if (title.includes('designer') || description.includes('designer')) skills.add('Design')
        if (title.includes('analyst') || description.includes('analyst')) skills.add('Data Analysis')
        if (title.includes('engineer') || description.includes('engineer')) skills.add('Engineering')
        if (title.includes('marketing') || description.includes('marketing')) skills.add('Marketing')
        if (title.includes('sales') || description.includes('sales')) skills.add('Sales')
        if (title.includes('admin') || description.includes('admin')) skills.add('Administration')
      })
    }

    // Determine experience level
    let experienceLevel = 'Entry Level'
    if (totalExperience >= 5) experienceLevel = 'Senior'
    else if (totalExperience >= 2) experienceLevel = 'Mid-Level'
    else if (totalExperience >= 1) experienceLevel = 'Junior'

    console.log(`   Experience Level: ${experienceLevel}`)
    console.log(`   Total Experience: ${totalExperience.toFixed(1)} years`)
    console.log(`   Key Skills: ${Array.from(skills).join(', ') || 'None detected'}`)
    console.log()

    // Test 8: Simulate job recommendations
    console.log('8. Simulating job recommendations...')
    
    const recommendations = []
    for (const job of jobs) {
      let matchScore = 0
      const whyGoodFit = []

      // Check skill matches
      skills.forEach(skill => {
        const skillLower = skill.toLowerCase()
        if (job.title.toLowerCase().includes(skillLower)) {
          matchScore += 20
          whyGoodFit.push(`Strong ${skill} experience`)
        }
      })

      // Check experience level match
      if (experienceLevel === 'Senior' && 
          (job.title.toLowerCase().includes('senior') || job.title.toLowerCase().includes('lead') || job.title.toLowerCase().includes('manager'))) {
        matchScore += 15
      } else if (experienceLevel === 'Mid-Level' && 
                 !job.title.toLowerCase().includes('senior') && !job.title.toLowerCase().includes('lead')) {
        matchScore += 15
      }

      // Normalize score
      matchScore = Math.min(100, Math.max(0, matchScore))

      if (matchScore > 30) {
        recommendations.push({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          matchScore,
          whyGoodFit
        })
      }
    }

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore)

    console.log(`✅ Generated ${recommendations.length} job recommendations`)
    recommendations.slice(0, 3).forEach(rec => {
      console.log(`   - ${rec.jobTitle} at ${rec.company} (${rec.matchScore}% match)`)
      console.log(`     Why: ${rec.whyGoodFit.join(', ')}`)
    })
    console.log()

    console.log('🎉 AI Analysis test completed successfully!')
    console.log('\n📝 Summary:')
    console.log(`   - User has ${totalExperience.toFixed(1)} years of experience`)
    console.log(`   - Experience level: ${experienceLevel}`)
    console.log(`   - Skills detected: ${Array.from(skills).length}`)
    console.log(`   - Job recommendations: ${recommendations.length}`)
    console.log(`   - CV available: ${docs && docs.length > 0 ? 'Yes' : 'No'}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAIAnalysis()
