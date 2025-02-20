"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CodeEditor() {
  const [language, setLanguage] = useState("Python");
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/auth/protected", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        const data = await response.json();
        setCurrentIndex(data.user.problemsSolved);
        setEmail(data.user.email);
      } catch (error) {
        console.error("Error verifying token:", error);
        localStorage.removeItem("token");
        router.push("/");
      }
    };

    verifyToken();
  }, [router]);

  const langId: Map<string, number> = new Map();
  langId.set("Python", 1);
  langId.set("C++", 2);
  langId.set("Java",3);

  const questions = [
    {
      id: 1,
      title: "Sum of numbers",
      description: "Given a bunch of nums, you must print the sum of them. The input is given in such a way that, the first line will have N(number of elements) and the next line will have N numbers separated by space.",
      testCases: [
        { input: "4\n1 2 3 4", output: "10" },
        { input: "5\n1 2 3 4 5", output: "15" },
      ],
    },
    {
      id: 2,
      title: "Find Maximum",
      description: "Given a list of numbers, find the maximum value. The input is given in such a way that, the first line will have N(number of elements) and the next line will have N numbers separated by space.",
      testCases: [
        { input: "4\n5 1 9 3", output: "9" },
        { input: "3\n-10 0 5", output: "5" },
      ],
    },
    {
      id: 3,
      title: "Count Even Numbers",
      description: "Given a list of numbers, count how many are even. The input is given in such a way that, the first line will have N(number of elements) and the next line will have N numbers separated by space.",
      testCases: [
        { input: "5\n1 2 3 4 5", output: "2" },
        { input: "6\n10 20 30 15 25 35", output: "3" },
      ],
    },
    {
      "id": 4,
      "title": "Count Vowels in a String",
      "description": "Given a string, count the number of vowels (a, e, i, o, u). The input will be a single line containing a string.",
      "testCases": [
        { input: "hello", output: "2" },
        { input: "openai", output: "4" },
      ]
    },    
    {
      "id": 5,
      "title": "Sum of Digits",
      "description": "Given a number, find the sum of its digits. The input consists of a single integer N.",
      "testCases": [
        { input: "123", output: "6" },
        { input: "987", output: "24" },
      ]
    },
    {
      "id": 6,
      "title": "Check Prime Number",
      "description": "Given a number N, determine whether it is a prime number or not. A prime number is a number greater than 1 that has no divisors other than 1 and itself. Output 1 if the number is prime, otherwise output 0.",
      "testCases": [
        { input: "7", output: "1" },
        { input: "10", output: "0" },
      ]
    },    
    {
      id: 7,
      title: "Completed",
      description: "Congradulations on Completing all the tasks successfully, We love your inverted thinking, all the best for your future endevours. PLEASE CALL A MODERATOR IMMEDIATELY.",
      testCases: [
      ],
    },
  ];

  const blockedKeys = [
    "Alt", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "PageDown", "Control", "CapsLock","Escape", "Unidentified", "AudioVolumeMute", "Meta", "End", "PageUp", "Home", "Delete", "Insert",
    "MediaPlayPause", "AudioVolumeDown", "AudioVolumeUp", "MediaTrackPrevious", "MediaTrackNext", "AltGraph"
  ];

  const handleKeyDown = (event:React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();

    if (blockedKeys.includes(event.key)) {
      return;
    }

    if (event.key === "Enter") {
      setCode((prev) => "\n" + prev);
    } else if (event.key === " ") {
      setCode((prev) => " " + prev);
    } else if (event.key === "Tab") { 
      setCode((prev) => "   " + prev);
    } else if (event.key === "Backspace") {
      setCode((prev) => prev.slice(1));
    } else {
      setCode((prev) => event.key + prev);
    }
  };

  const handleRun = async () => {
    try {
      const response = await fetch("http://localhost:3001/code/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          languageId: langId.get(language),
          QuestionId: questions[currentIndex].id,
        }),
      });
  
      const data = await response.json();
      if(data.status==="Failed"){
        setOutput(data.message);
      }
      else{
      let output="";
      for (let i=0;i<data.outputs.length;i++){
        output+=data.outputs[i]+"\n";
      }
      setOutput(output);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
    }
  
    //setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3001/code/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email:email,
          code: code,
          languageId: langId.get(language),
          QuestionId: questions[currentIndex].id,
        }),
      });
  
      const data = await response.json();
      if(data.status=="Accepted"){
        setCode("");
        setOutput("");
        alert("Accepted");
        setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
        return;
      }
      setOutput(data.message);
    } catch (error) {
      console.error("Error submitting code:", error);
    }
  };
  

  return (
    <div className="flex flex-col h-screen w-screen p-4 bg-customDark text-white text-xl">
      <div className="flex justify-between items-center p-4 rounded-md border border-white">
        <h1 className="text-xl font-bold">Topsy-Turvy</h1>
        <div className="p-2 rounded-md text-white">{email}</div>
        <div>
          <select
            value={language}
            onChange={(e) => {setLanguage(e.target.value);setCode("")}}
            className="p-2 rounded-md text-white bg-customDark border-white"
          >
            <option>Python</option>
            <option>C++</option>
            <option>Java</option>
          </select>
        </div>
      </div>

      <div className="flex flex-grow mt-4 space-x-4 overflow-hidden">
        <div className="flex flex-col w-1/3 p-4 rounded-md border border-white">
          <div className="h-2/5 border-b border-white">
            <strong className="block bg-customDark p-2 border-b border-white sticky top-0">
              Problem Statement: {questions[currentIndex].title}
            </strong>
            <div className="overflow-y-auto p-2 h-full">
              {questions[currentIndex].description}
            </div>
          </div>
          <div className="h-3/5">
            <strong className="block bg-customDark p-2 border-b border-white sticky top-0">Example Testcases:</strong>
            <div className="overflow-y-auto p-2 h-full text-lg">
              {questions[currentIndex].testCases.map((test, index) => (
                <p key={index}>
                  <strong>TestCase{index + 1}:</strong> <br />
                  {test.input.split("\n").map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                  <strong>Output:</strong> {test.output}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-2/3 p-4 rounded-md border border-white">
          <textarea
            className="flex-grow bg-customDark p-2 rounded-md text-white resize-none overflow-y-auto border border-white"
            placeholder="Type your code here"
            value={code}
            onKeyDown={handleKeyDown}
            readOnly
          ></textarea>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={handleRun} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Run</button>
            <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
        </div>
      </div>
      
      <div className="flex mt-4 space-x-4 overflow-hidden">
        <div className="flex flex-col w-1/2 p-4 rounded-md border border-white">
          <strong className="block bg-customDark p-2 border-b border-white sticky top-0">Expected Output</strong>
          <div className="h-40 overflow-y-auto p-2">{questions[currentIndex].testCases.map((test, index) => (
            <p key={index}>{test.output}</p>
          ))}</div>
        </div>

        <div className="flex flex-col w-1/2 p-4 rounded-md border border-white">
          <strong className="block bg-customDark p-2 border-b border-white sticky top-0">Your Output</strong>
          <div className="h-40 overflow-y-auto p-2 whitespace-pre-line">{output}</div>
        </div>
      </div>
    </div>
  );
}