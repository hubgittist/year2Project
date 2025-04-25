const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class MLService {
  constructor() {
    this.modelPath = path.join(__dirname, '../../ML model/loan_model.py');
  }

  async predictLoanRepayment(bankStatement) {
    try {
      // Save bank statement temporarily for analysis
      const tempPath = path.join(__dirname, `../../temp/${Date.now()}_statement.csv`);
      await fs.writeFile(tempPath, bankStatement);

      // Spawn Python process to run prediction
      const pythonProcess = spawn('python', [this.modelPath, tempPath]);

      return new Promise((resolve, reject) => {
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.on('close', async (code) => {
          // Clean up temp file
          await fs.unlink(tempPath);

          if (code !== 0) {
            reject(new Error(`ML prediction failed: ${error}`));
            return;
          }

          try {
            const prediction = JSON.parse(result);
            resolve({
              probability: prediction.probability,
              risk_score: prediction.risk_score,
              recommendation: prediction.recommendation
            });
          } catch (err) {
            reject(new Error('Failed to parse ML model output'));
          }
        });
      });
    } catch (error) {
      throw new Error(`ML Service error: ${error.message}`);
    }
  }

  async analyzeBankStatement(statementData) {
    try {
      const analysis = {
        averageMonthlyIncome: 0,
        incomeStability: 0,
        expensePatterns: [],
        riskIndicators: [],
        creditScore: 0
      };

      // Process statement data
      // This is a placeholder for the actual analysis logic
      // In production, this would use more sophisticated analysis methods

      return analysis;
    } catch (error) {
      throw new Error(`Bank statement analysis failed: ${error.message}`);
    }
  }
}

module.exports = new MLService();
