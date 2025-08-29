import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Leaf, 
  Shield, 
  Users, 
  Award, 
  Truck, 
  Package,
  Star,
  CheckCircle
} from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-amber-500" />,
      title: "Quality First",
      description: "We never compromise on the quality of our products. Every batch is carefully tested to ensure it meets our high standards."
    },
    {
      icon: <Leaf className="w-8 h-8 text-amber-500" />,
      title: "Natural & Organic",
      description: "We source only the finest natural ingredients and follow traditional preparation methods passed down through generations."
    },
    {
      icon: <Shield className="w-8 h-8 text-amber-500" />,
      title: "Trust & Transparency",
      description: "We believe in complete transparency about our sourcing, preparation methods, and product quality."
    },
    {
      icon: <Users className="w-8 h-8 text-amber-500" />,
      title: "Customer Focus",
      description: "Our customers are at the heart of everything we do. We strive to exceed their expectations every day."
    }
  ];

  const milestones = [
    {
      year: "2018",
      title: "Founded",
      description: "Started with a vision to bring authentic ghee to every household"
    },
    {
      year: "2019",
      title: "First 1000 Customers",
      description: "Reached our first milestone of 1000 satisfied customers"
    },
    {
      year: "2020",
      title: "Organic Certification",
      description: "Received organic certification for our premium ghee products"
    },
    {
      year: "2021",
      title: "National Expansion",
      description: "Expanded our reach across major cities in India"
    },
    {
      year: "2022",
      title: "10,000+ Customers",
      description: "Celebrated serving over 10,000 happy customers"
    },
    {
      year: "2023",
      title: "Award Recognition",
      description: "Received 'Best Organic Ghee Brand' award"
    }
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image: "/team/rajesh.jpg",
      description: "With over 15 years of experience in dairy products, Rajesh leads our mission to bring authentic ghee to every home."
    },
    {
      name: "Priya Sharma",
      role: "Head of Quality",
      image: "/team/priya.jpg",
      description: "Priya ensures every product meets our stringent quality standards and maintains our traditional preparation methods."
    },
    {
      name: "Amit Patel",
      role: "Operations Manager",
      image: "/team/amit.jpg",
      description: "Amit oversees our production facilities and ensures smooth operations across all our locations."
    },
    {
      name: "Meera Singh",
      role: "Customer Success",
      image: "/team/meera.jpg",
      description: "Meera leads our customer support team and ensures every customer has an exceptional experience."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="text-amber-700 bg-amber-100 mb-4">
            About Us
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our Story
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are passionate about bringing you the finest quality ghee products, 
            sourced from the best farms and prepared using traditional methods that 
            have been passed down through generations.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To provide every household with authentic, pure, and high-quality ghee 
                that not only enhances the taste of their food but also contributes to 
                their health and well-being.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Traditional Methods</h4>
                    <p className="text-gray-600">We follow age-old preparation techniques</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Assurance</h4>
                    <p className="text-gray-600">Rigorous testing at every stage</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer Satisfaction</h4>
                    <p className="text-gray-600">Your happiness is our priority</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-amber-100 rounded-2xl flex items-center justify-center">
                <Package className="w-32 h-32 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center card-hover">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From humble beginnings to becoming a trusted name in premium ghee products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.year}</h3>
                      <p className="text-amber-600 font-medium">{milestone.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind our success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center card-hover">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-amber-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-amber-100">Happy Customers</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-amber-100">Product Varieties</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">5+</div>
              <div className="text-amber-100">Years of Excellence</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-amber-100">Quality Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Experience the Difference
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust us for their daily ghee needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products" className="inline-block">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-medium">
                Shop Now
              </button>
            </a>
            <a href="/contact" className="inline-block">
              <button className="border border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
