if (!window.apiBasePath) {
  console.warn('USING MOCK DATA, configure your apiBasePath')
  // load the mock data if no API is available
  window.axios.get('/js/data.json')
    .then((response) => {
      window.gigs = response.data
    })
}

const getGigsMock = (cb) => {
  if (!window.gigs) return setTimeout(() => { getGigsMock(cb) }, 1000)
  setTimeout(() => cb(null, window.gigs), 200)
}

const getGigMock = (slug, cb) => {
  if (!window.gigs) return setTimeout(() => { getGigMock(slug, cb) }, 1000)
  setTimeout(() => {
    const gig = window.gigs.find(gig => gig.slug === slug)
    if (!gig) {
      return cb(new Error('Not found'))
    }

    return cb(null, gig)
  }, 200)
}

const submitPaymentMock = (payment, cb) => {
  // can succeed or fail with 50% chance
  const success = Math.random() >= 0.5
  setTimeout(() => {
    if (!success) {
      return cb(new Error('Card declined'))
    }

    return cb(null, { success })
  }, 2200)
}

const getGigs = (cb) => {
  if (!window.apiBasePath) return getGigsMock(cb)

  window.axios.get(`${window.apiBasePath}/gigs`)
    .then((response) => {
      return cb(null, response.data.gigs)
    })
    .catch(err => {
      return cb(err)
    })
}

const getGig = (slug, cb) => {
  if (!window.apiBasePath) return getGigMock(slug, cb)

  window.axios.get(`${window.apiBasePath}/gigs/${slug}`)
    .then((response) => {
      return cb(null, response.data)
    })
    .catch(err => {
      return cb(err)
    })
}

const submitPayment = (payment, cb) => {
  if (!window.apiBasePath) return submitPaymentMock(payment, cb)

  window.axios.post(`${window.apiBasePath}/purchase`, payment)
    .then((response) => {
      return cb(null, response.data)
    })
    .catch(err => {
      return cb(err)
    })
}

const NotFound = {
  template: `
    <div class="content">
      <h1>Page not found</h1>
      <router-link to="/">Go back to the Homa page</router-link>
    </div>`
}
window.Vue.component('not-found', NotFound)

const GigCard = {
  props: ['image', 'bandName', 'city', 'date', 'slug', 'year'],
  template: `
<div class="card" style="height:100%">
  <div class="card-image">
    <figure class="image is-3by1">
      <router-link :to="'/gig/' + slug">
        <img class="card-img-top" :src="'/images/' + image" :alt="bandName">
      </router-link>
    </figure>
  </div>
  <div class="card-content">
    <div class="media-content">
      <p class="title is-4">{{bandName}}, {{city}} ({{year}})</p>
      <p class="subtitle is-6">{{date}}</p>
      <router-link :to="'/gig/' + slug" class="btn btn-primary">Get tickets</router-link>
    </div>
  </div>
</div>`
}
window.Vue.component('gig-card', GigCard)

const GigList = {
  template: `
  <div>
    <div v-if="gigs.length">
      <div class="content">
        <h3>There are {{gigs.length}} gigs currently available</h3>
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
  <div v-if="gig">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link to="/">Gigs</router-link></li>
        <li class="is-active">
          <router-link :to="'/gig/' + gig.slug">{{gig.bandName}} ({{gig.year}})</router-link>
        </li>
      </ul>
    </nav>
    <section class="section" style="border: 1px solid #ccc">
      <h1 class="title">
        {{gig.bandName}} ({{gig.year}})
      </h1>
      <div class="columns">
        <div class="column is-7">
          <div class="content">
            <p>
              <img :src="'/images/' + gig.image" />
            </p>
            <p>
              {{gig.description}}
            </p>
          </div>
        </div>
        <div class="column is-5">
          <div class="panel">
            <p class="panel-heading">
              {{gig.city}}
            </p>
            <div class="panel-block">
              {{gig.venue}}
            </div>
            <div class="panel-block">
              {{gig.originalDate}}
            </div>
            <div class="panel-block">
              <strong>{{gig.price}} USD</strong>
            </div>
          </div>
          <div class="panel">
            <p class="panel-heading">
              Time travel collection point
            </p>
            <div class="panel-block">
              <a :href="mapUrl(gig.collectionPoint)" target="_blank">
                <img :src="'/images/' + gig.collectionPointMap"/>
              </a>
            </div>
            <div class="panel-block">
              <a :href="mapUrl(gig.collectionPoint)" target="_blank">
                {{gig.collectionPoint}}
              </a>
            </div>
            <div class="panel-block">
              {{gig.date}}, {{gig.collectionTime}}&nbsp;<small>Local time</small>
            </div>
          </div>
          <a href="#buy" class="button is-outlined is-link" v-on:click="scrollToBuy">Buy ticket</a>
        </div>
      </div>
    </section>
    <hr/>
    <section class="section">
      <div class="columns">
        <div class="column is-7">
          <div class="content">
            <h3 id="buy">Buy a ticket ({{gig.price}} USD)</h3>
            <a href="#" v-on:click="fillWithDemoData">
              <small>(quick fill form)</small>
            </a>
          </div>
          <input type="hidden" v-model="payment.gig">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input
                name="name"
                :class="{'input': true, 'is-danger': errors.has('name') }"
                type="text"
                :disabled="paymentInProgress"
                v-validate="'required'"
                placeholder="e.g Alex Smith"
                v-model="payment.name"
              />
              <p v-show="errors.has('name')" class="help is-danger">{{ errors.first('name') }}</p>
            </div>
          </div>
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input
                name="email"
                :class="{'input': true, 'is-danger': errors.has('email') }"
                type="email"
                :disabled="paymentInProgress"
                v-validate="'required|email'"
                placeholder="e.g. alexsmith@gmail.com"
                v-model="payment.email"
              />
              <p v-show="errors.has('email')" class="help is-danger">{{ errors.first('email') }}</p>
            </div>
          </div>
          <div class="field">
            <label class="label">Credit Card Number</label>
            <div class="control">
              <input
                name="cardNumber"
                :class="{'input': true, 'is-danger': errors.has('cardNumber') }"
                type="text"
                :disabled="paymentInProgress"
                v-validate="'required|credit_card'"
                placeholder="e.g. 1234 5678 9012 3456"
                v-model="payment.cardNumber"
              />
              <p v-show="errors.has('cardNumber')" class="help is-danger">{{ errors.first('cardNumber') }}</p>
            </div>
          </div>
          <div class="columns">
            <div class="column is-4">
              <div class="field">
                <label class="label">Expiry Month</label>
                <div class="control">
                  <div :class="{'select': true, 'is-danger': errors.has('cardExpiryMonth') }">
                    <select
                      name="cardExpiryMonth"
                      v-validate="{ required: true, in: cardExpiryMonthOptionsValues }"
                      :disabled="paymentInProgress"
                      v-model="payment.cardExpiryMonth"
                    >
                      <option value=""/>
                      <option v-for="option in cardExpiryMonthOptions" v-bind:value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                    <p v-show="errors.has('cardExpiryMonth')" class="help is-danger">{{ errors.first('cardExpiryMonth') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">Expiry Year</label>
                <div class="control">
                  <div :class="{'select': true, 'is-danger': errors.has('cardExpiryYear') }">
                    <select
                      name="cardExpiryYear"
                      :disabled="paymentInProgress"
                      v-validate="{ required: true, in: cardExpiryYearOptions }"
                      v-model="payment.cardExpiryYear"
                    >
                      <option value=""/>
                      <option v-for="option in cardExpiryYearOptions">
                        {{ option }}
                      </option>
                    </select>
                    <p v-show="errors.has('cardExpiryYear')" class="help is-danger">{{ errors.first('cardExpiryYear') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">CVC</label>
                <div class="control">
                  <input
                    name="cardCVC"
                    :class="{'input': true, 'is-danger': errors.has('cardCVC') }"
                    type="text"
                    :disabled="paymentInProgress"
                    v-validate="{ required: true, regex: /^[0-9]{3,4}$/ }"
                    placeholder="e.g. 123"
                    v-model="payment.cardCVC"
                  />
                  <p v-show="errors.has('cardCVC')" class="help is-danger">{{ errors.first('cardCVC') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <label class="checkbox">
                <input
                  name="disclaimerAccepted"
                  type="checkbox"
                  :disabled="paymentInProgress"
                  v-validate="'required'"
                  v-model="payment.disclaimerAccepted"
                /> I understand this is a demo site and that
                <strong>I don't have to use a real credit card</strong> I own!
                No attempt to charge the card will be made anyway :)
                <p v-show="errors.has('disclaimerAccepted')" class="help is-danger">{{ errors.first('disclaimerAccepted') }}</p>
              </label>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button
                :disabled="isFormInvalid"
                :class="{ 'button': true, 'is-primary': true, 'is-large': true, 'is-loading': paymentInProgress }"
                v-on:click="submitPayment"
              >Purchase</button>
            </div>
          </div>
          <div v-show="paymentResult" class="notification is-primary">
            <button class="delete" v-on:click="paymentResult = null"></button>
            <p>Payment processed correctly! you should receive an email with your ticket shortly.</p>
            <p><small>You can buy a new ticket by entering a new name and a new email</small></p>
          </div>
          <div v-show="paymentError" class="notification is-danger">
            <button class="delete" v-on:click="paymentError = null"></button>
            <p>Ooops, something went wrong with your payment!</p>
            <p><small><strong>{{paymentError}}</strong></small></p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-if="loading">
    Loading...
  </div>

  <div v-if="error">
    <template v-if="error === 'Error: Not found'">
      <not-found/>
    </template>
    <template v-else>
      {{error}}
    </template>
  </div>

</div>
`,
  data () {
    return {
      loading: false,
      gig: undefined,
      error: undefined,
      paymentInProgress: false,
      paymentError: undefined,
      paymentResult: undefined,
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
        { text: '12 - Dec', value: 12 }
      ],
      cardExpiryYearOptions: [2018, 2019, 2020, 2021, 2022, 2023, 2024]
    }
  },
  computed: {
    cardExpiryMonthOptionsValues: function () {
      return this.cardExpiryMonthOptions.map(o => o.value)
    },
    isFormInvalid: function () {
      return !(
        this.errors.items.length === 0 &&
        this.payment.gig &&
        this.payment.name &&
        this.payment.email &&
        this.payment.cardNumber &&
        this.payment.cardExpiryMonth &&
        this.payment.cardExpiryYear &&
        this.payment.cardCVC &&
        this.payment.disclaimerAccepted
      )
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
    },
    submitPayment () {
      if (!this.isFormInvalid && !this.paymentInProgress) {
        this.paymentInProgress = true
        this.paymentError = null
        this.paymentResult = null
        submitPayment(this.payment, (err, result) => {
          this.paymentInProgress = false
          if (err) {
            this.paymentError = err.message ? err.message : JSON.stringify(err)
            return this.paymentError
          }

          this.paymentResult = result
          // resets name and email to easily allow the quick purchase of another ticket
          this.payment.name = undefined
          this.payment.email = undefined
        })
      }
    },
    fillWithDemoData (event) {
      event.preventDefault()
      this.payment.name = 'Alex Smith'
      this.payment.email = 'alexsmith@gmail.com'
      this.payment.cardNumber = '5454545454545454'
      this.payment.cardExpiryMonth = '5'
      this.payment.cardExpiryYear = '2020'
      this.payment.cardCVC = '123'
      this.payment.disclaimerAccepted = true
    },
    scrollToBuy (event) {
      event.preventDefault()
      const sc = document.scrollingElement || document.documentElement
      sc.scrollTop = document.getElementById('buy').offsetTop
    },
    mapUrl (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    }
  }
}

const routes = [
  { path: '/', component: GigList },
  { path: '/gig/:slug', component: GigPage },
  { path: '*', component: NotFound }
]

const router = new window.VueRouter({
  routes,
  mode: 'history'
})

window.Vue.use(window.VeeValidate)
new window.Vue({
  router,
  data: {}
}).$mount('#app')
