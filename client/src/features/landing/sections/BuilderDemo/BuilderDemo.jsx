import { motion } from "framer-motion";
import { Sparkles, User, Code, Globe } from "lucide-react";

import Section from "../../../../components/ui/Section/Section";
import Container from "../../../../components/ui/Container/Container";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Heading from "../../../../components/ui/Heading/Heading";

const BuilderDemo = () => {
  return (
    <Section className="bg-[#09090B]">
      <Container>
        <div className="text-center mb-20">
          <Heading
            title="Build Your Portfolio in Minutes"
            subtitle="Fill your information on the left and watch your portfolio update instantly."
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}

          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <User className="text-indigo-500" />
                <span className="text-white">John Doe</span>
              </div>

              <div className="flex items-center gap-3">
                <Code className="text-indigo-500" />
                <span className="text-white">MERN Stack Developer</span>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="text-indigo-500" />
                <span className="text-white">github.com/johndoe</span>
              </div>

              <Button className="w-full mt-8">Generate Portfolio</Button>
            </div>
          </Card>

          {/* Right */}

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Sparkles className="text-yellow-400" />
              </div>

              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl text-white font-bold">
                JD
              </div>

              <h2 className="text-4xl text-white font-bold mt-6">John Doe</h2>

              <p className="text-indigo-400 mt-2">MERN Stack Developer</p>

              <div className="mt-8 flex gap-3 flex-wrap">
                {["React", "Node", "MongoDB", "Express"].map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default BuilderDemo;
