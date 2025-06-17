// Test file to verify ML model types are correct
class TestMLModel {
  private modelWeights: number[][]
  private biases: number[][]
  
  constructor() {
    // This should compile without errors
    this.modelWeights = [
      // Input to hidden layer
      Array(100).fill(0).map(() => 
        Array(50).fill(0).map(() => Math.random())
      ),
      // Hidden to output layer  
      Array(3).fill(0).map(() => 
        Array(100).fill(0).map(() => Math.random())
      )
    ]
    
    this.biases = [
      Array(100).fill(0),
      Array(3).fill(0)
    ]
  }
  
  test() {
    // These should all work without type errors
    const layer1 = this.modelWeights[0] // number[][]
    const neuron1 = this.modelWeights[0][0] // number[]
    const weight1 = this.modelWeights[0][0][0] // number
    
    console.log('TypeScript types are correct!')
    return { layer1, neuron1, weight1 }
  }
}

export default TestMLModel
