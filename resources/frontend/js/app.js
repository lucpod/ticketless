if (!window.apiBasePath) {
  console.warn('USING MOCK DATA, configure your apiBasePath')
  // load the mock data if no API is available
  axios.get('/js/data.json')
    .then((response) => {
      window.gigs = response.data
    })
}

const getGigsMock = (cb) => {
  if (!window.gigs) return setTimeout(() => {getGigsMock(cb)}, 1000)
  setTimeout(() => cb(null, gigs), 200)
}

const getGigMock = (slug, cb) => {
  if (!window.gigs) return setTimeout(() => {getGigMock(slug, cb)}, 1000)
  setTimeout(() => {
    const gig = window.gigs.find(gig => gig.slug === slug)
    if (!gig) {
      return cb(new Error('Gig Not found'))
    }

    return cb(null, gig)
  }, 200)
}

const getGigs = (cb) => {
  if (!window.apiBasePath) return getGigsMock(cb)

  axios.get(`${window.apiBasePath}/gigs`)
    .then((response) => {
      return cb(null, response.data.gigs)
    })
    .catch(err => {
      return cb(err)
    })
}

const getGig = (slug, cb) => {
  if (!window.apiBasePath) return getGigMock(slug, cb)

  axios.get(`${window.apiBasePath}/gigs/${slug}`)
    .then((response) => {
      return cb(null, response.data)
    })
    .catch(err => {
      return cb(err)
    })
}

const GigCard = {
  props: ['image', 'bandName', 'city', 'date', 'slug'],
  template: `
<div class="card">
  <div class="card-image">
    <figure class="image is-3by1">
      <router-link :to="'/gig/' + slug">
        <img class="card-img-top" :src="'/images/' + image" :alt="bandName">
      </router-link>
    </figure>
  </div>
  <div class="card-content">
    <div class="media-content">
      <p class="title is-4">{{ bandName }}, {{ city }}</p>
      <p class="subtitle is-6">{{ date }}</p>
      <router-link :to="'/gig/' + slug" class="btn btn-primary">Get tickets</router-link>
    </div>
  </div>
</div>`
}
Vue.component('gig-card', GigCard)

const GigList = {
  template: `
  <div>
    <div v-if="gigs.length">
      <div class="content">
        <h1>{{gigs.length}} Gigs currently available</h1>
      </div>
    </div>

    <div class="columns is-multiline">
      <div class="column is-one-third" v-for="gig in gigs">
        <gig-card v-bind="gig"/>
      </div>
    </div>

    <div v-if="loading">
      Loading...
    </div>

    <div v-if="error">
      {{error}}
    </div>
  </div>
`,
  data () {
    return {
      loading: false,
      gigs: [],
      error: null
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData () {
      this.error = null
      this.gigs = []
      this.loading = true
      getGigs((err, gigs) => {
        this.loading = false
        if (err) {
          this.error = err.toString()
        } else {
          this.gigs = gigs
        }
      })
    }
  }
}

const GigPage = {
  template: `
<div>
  <div v-if="gig" style="border: 1px solid #ccc; max-width: 800px">
    <section class="section">
      <h1 class="title">
    {{gig.bandName}}
  </h1>
      <div class="columns">
        <div class="column is-9">
          <div class="content">
            <p>
              <img :src="'/images/' + gig.image" />
            </p>
            <p>
              {{gig.description}}
            </p>
          </div>
        </div>
        <div class="column is-3">
          <div class="panel">
            <p class="panel-heading">
              {{gig.city}}
            </p>
            <div class="panel-block">
              {{gig.venue}}
            </div>
            <div class="panel-block">
              {{gig.date}}
            </div>
            <div class="panel-block">
              <strong>{{gig.price}} EUR</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
    <hr/>
    <section class="section">
      <div class="columns">
        <div class="column is-9">
          <div class="content">
            <h3>Buy a ticket</h3>
          </div>
          <input type="hidden" v-model="payment.gig">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input class="input" type="text" placeholder="e.g Alex Smith" v-model="payment.name">
            </div>
          </div>
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input class="input" type="email" placeholder="e.g. alexsmith@gmail.com" v-model="payment.email">
            </div>
          </div>
          <div class="field">
            <label class="label">Credit Card Number</label>
            <div class="control">
              <input class="input" type="text" placeholder="e.g. 1234 5678 9012 3456" v-model="payment.cardNumber">
            </div>
          </div>
          <div class="columns">
            <div class="column is-4">
              <div class="field">
                <label class="label">Expiry Month</label>
                <div class="control">
                  <div class="select">
                    <select v-model="payment.cardExpiryMonth">
                      <option v-for="option in cardExpiryMonthOptions" v-bind:value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">Expiry Year</label>
                <div class="control">
                  <div class="select">
                    <select v-model="payment.cardExpiryYear">
                      <option v-for="option in cardExpiryYearOptions">
                        {{ option }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">CVC</label>
                <div class="control">
                  <input class="input" type="text" placeholder="e.g. 123" v-model="payment.cardCVC">
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="payment.disclaimerAccepted"> I understand this is a demo
                site and that <strong>I don't have to use a real credit card</strong> I own! No attempt to charge
                the card will be made anyway
                :)
              </label>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button class="button is-primary is-large">Purchase</button>
            </div>
          </div>
          <div><code><pre>{{ payment | json }}</pre></code></div>
        </div>
      </div>
    </section>
  </div>

  <div v-if="loading">
    Loading...
  </div>

  <div v-if="error">
    {{error}}
  </div>

</div>
`,
  data () {
    return {
      loading: false,
      gig: undefined,
      error: undefined,
      payment: {
        gig: undefined,
        name: undefined,
        email: undefined,
        cardNumber: undefined,
        cardExpiryMonth: undefined,
        cardExpiryYear: undefined,
        cardCVC: undefined,
        disclaimerAccepted: undefined
      },
      cardExpiryMonthOptions: [
        { text: '', value: undefined },
        { text: '01 - Jan', value: 1 },
        { text: '02 - Feb', value: 2 },
        { text: '03 - Mar', value: 3 },
        { text: '04 - Apr', value: 4 },
        { text: '05 - May', value: 5 },
        { text: '06 - Jun', value: 6 },
        { text: '07 - Jul', value: 7 },
        { text: '08 - Aug', value: 8 },
        { text: '09 - Sep', value: 9 },
        { text: '10 - Oct', value: 10 },
        { text: '11 - Nov', value: 11 },
        { text: '12 - Dec', value: 12 },
      ],
      cardExpiryYearOptions: ['', 2018, 2019, 2020, 2021, 2022, 2023, 2024]
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData () {
      this.error = null
      this.gig = null
      this.loading = true
      getGig(this.$route.params.slug, (err, gig) => {
        this.loading = false
        if (err) {
          this.error = err.toString()
        } else {
          this.gig = gig
          this.payment.gig = gig.slug
        }
      })
    }
  }
}

const routes = [
  { path: '/', component: GigList },
  { path: '/gig/:slug', component: GigPage }
]

const router = new VueRouter({routes, mode: 'history'})

const app = new Vue({
  router,
  data: {}
}).$mount('#app')

// Now the app has started!
