import Stripe from 'stripe';

const stripeCountryObjs = [
  { country: 'Argentina', code: 'AR' },
  { country: 'Australia', code: 'AU' },
  { country: 'Austria', code: 'AT' },
  { country: 'Belgium', code: 'BE' },
  { country: 'Bolivia', code: 'BO' },
  { country: 'Brazil', code: 'BR' },
  { country: 'Bulgaria', code: 'BG' },
  { country: 'Canada', code: 'CA' },
  { country: 'Chile', code: 'CL' },
  { country: 'Colombia', code: 'CO' },
  { country: 'Costa Rica', code: 'CR' },
  { country: 'Croatia', code: 'HR' },
  { country: 'Cyprus', code: 'CY' },
  { country: 'Czech Republic', code: 'CZ' },
  { country: 'Denmark', code: 'DK' },
  { country: 'Dominican Republic', code: 'DO' },
  { country: 'Estonia', code: 'EE' },
  { country: 'Finland', code: 'FI' },
  { country: 'France', code: 'FR' },
  { country: 'Germany', code: 'DE' },
  { country: 'Greece', code: 'GR' },
  { country: 'Hong Kong SAR China', code: 'HK' },
  { country: 'Hungary', code: 'HU' },
  { country: 'Iceland', code: 'IS' },
  { country: 'India', code: 'IN' },
  { country: 'Indonesia', code: 'ID' },
  { country: 'Ireland', code: 'IE' },
  { country: 'Israel', code: 'IL' },
  { country: 'Italy', code: 'IT' },
  { country: 'Japan', code: 'JP' },
  { country: 'Latvia', code: 'LV' },
  { country: 'Liechtenstein', code: 'LI' },
  { country: 'Lithuania', code: 'LT' },
  { country: 'Luxembourg', code: 'LU' },
  { country: 'Malta', code: 'MT' },
  { country: 'Mexico ', code: 'MX' },
  { country: 'Netherlands', code: 'NL' },
  { country: 'New Zealand', code: 'NZ' },
  { country: 'Norway', code: 'NO' },
  { country: 'Paraguay', code: 'PY' },
  { country: 'Peru', code: 'PE' },
  { country: 'Poland', code: 'PL' },
  { country: 'Portugal', code: 'PT' },
  { country: 'Romania', code: 'RO' },
  { country: 'Singapore', code: 'SG' },
  { country: 'Slovakia', code: 'SK' },
  { country: 'Slovenia', code: 'SI' },
  { country: 'Spain', code: 'ES' },
  { country: 'Sweden', code: 'SE' },
  { country: 'Switzerland', code: 'CH' },
  { country: 'Thailand', code: 'TH' },
  { country: 'Trinidad & Tobago', code: 'TT' },
  { country: 'United Arab Emirates', code: 'AE' },
  { country: 'United Kingdom', code: 'GB' },
  { country: 'United States', code: 'US' },
  { country: 'Uruguay', code: 'UY' }
]

const stripeCountryCodeArr = stripeCountryObjs.map((countryObj)=>{
 const codeArray=[]
  const{code} = countryObj
   codeArray.push(code)

  return codeArray.join(' ')
})



const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body)
    try {
      // Create Checkout Sessions from body params.

      const params = {
        submit_type: 'pay',
        mode: 'payment',
        payment_method_types:['card'],
        billing_address_collection: 'auto',
        shipping_address_collection: {allowed_countries: stripeCountryCodeArr},
        shipping_options: [
            {shipping_rate: 'shr_1MCyrXKz69mUHYoDaik2Q9zA'},
            {shipping_rate: 'shr_1MCyurKz69mUHYoDd5AYtLUg'}
        ],
        line_items: req.body.map((item) => {
            const img = item.image[0].asset._ref;
            const newImage = img.replace('image-', 'https://cdn.sanity.io/images/1gxdk71x/production/').replace('-webp','.webp','-jpg','.jpg','-png','.png');
            
            console.log('IMAGE', newImage)
            return {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: item.name,
                    images: [newImage],
                  },
                  unit_amount: item.price * 100,
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity
        }}),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
      }
      
     const session = await stripe.checkout.sessions.create(params);
     console.log('SESSIONID', session.id)
     res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
 
}








