import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RebalanceCalculator = () => {
  const [assets, setAssets] = useState([
    { name: '股票', current: '', target: '70', amount: 0, adjustAmount: 0, risk: 1.0 },
    { name: '現金', current: '', target: '30', amount: 0, adjustAmount: 0, risk: 0.0 }
  ]);

  const [riskProfile, setRiskProfile] = useState('moderate');
  
  const riskProfiles = {
    conservative: { name: '保守型', stockTarget: 50, description: '適合風險承受度低的投資者' },
    moderate: { name: '穩健型', stockTarget: 70, description: '適合可承受中等風險的投資者' },
    aggressive: { name: '積極型', stockTarget: 90, description: '適合風險承受度高的投資者' }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateRiskExposure = (assets) => {
    const total = assets.reduce((sum, asset) => sum + Number(asset.current), 0);
    const weightedRisk = assets.reduce((sum, asset) => {
      const weight = Number(asset.current) / total;
      return sum + (weight * asset.risk);
    }, 0);
    return (weightedRisk * 100).toFixed(1);
  };

  const updateTargetsBasedOnRisk = (profile) => {
    const stockTarget = riskProfiles[profile].stockTarget;
    const newAssets = [...assets];
    newAssets[0].target = stockTarget;
    newAssets[1].target = 100 - stockTarget;
    setAssets(newAssets);
  };

  const calculateRebalance = () => {
    const total = assets.reduce((sum, asset) => sum + Number(asset.current), 0);
    
    return assets.map(asset => {
      const currentPercentage = (Number(asset.current) / total * 100);
      const targetAmount = (total * Number(asset.target) / 100);
      const adjustAmount = targetAmount - Number(asset.current);
      
      return {
        ...asset,
        currentPercentage: currentPercentage.toFixed(1),
        amount: targetAmount,
        adjustAmount: adjustAmount
      };
    });
  };

  const handleCalculate = () => {
    const results = calculateRebalance();
    setAssets(results);
  };

  const handleInputChange = (index, field, value) => {
    const newAssets = [...assets];
    newAssets[index][field] = value;
    setAssets(newAssets);
  };

  const handleRiskProfileChange = (value) => {
    setRiskProfile(value);
    updateTargetsBasedOnRisk(value);
  };

  const totalAmount = assets.reduce((sum, asset) => sum + Number(asset.current) || 0, 0);
  const currentRiskExposure = calculateRiskExposure(assets);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-center">投資組合再平衡計算機</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">選擇風險承受度：</label>
            <Select value={riskProfile} onValueChange={handleRiskProfileChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">{riskProfiles.conservative.name}</SelectItem>
                <SelectItem value="moderate">{riskProfiles.moderate.name}</SelectItem>
                <SelectItem value="aggressive">{riskProfiles.aggressive.name}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">{riskProfiles[riskProfile].description}</p>
          </div>

          <div className="text-lg font-medium flex justify-between">
            <span>總投資金額: {formatCurrency(totalAmount)} 元</span>
            <span>目前風險曝險: {currentRiskExposure}%</span>
          </div>

          <div className="grid grid-cols-3 gap-4 font-medium">
            <div>資產類別</div>
            <div>目前金額</div>
            <div>目標比例</div>
          </div>
          
          {assets.map((asset, index) => (
            <div key={asset.name} className="grid grid-cols-3 gap-4 items-center">
              <div>{asset.name}</div>
              <Input
                type="number"
                value={asset.current}
                onChange={(e) => handleInputChange(index, 'current', e.target.value)}
                placeholder="輸入金額"
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={asset.target}
                  onChange={(e) => handleInputChange(index, 'target', e.target.value)}
                  className="w-20"
                />
                <span>%</span>
              </div>
            </div>
          ))}
          
          <Button onClick={handleCalculate} className="w-full">
            計算再平衡
          </Button>

          {assets[0].adjustAmount !== 0 && (
            <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-lg">目前資產配置:</div>
              {assets.map(asset => (
                <div key={asset.name} className="flex justify-between">
                  <span>{asset.name}:</span>
                  <span>{asset.currentPercentage}%</span>
                </div>
              ))}

              <div className="text-sm text-gray-600 mt-2">
                調整後預計風險曝險: {(assets[0].target * assets[0].risk).toFixed(1)}%
              </div>

              <div className="font-medium text-lg mt-6">調整建議:</div>
              {assets.map(asset => (
                <div key={asset.name} className="flex justify-between items-center">
                  <span>{asset.name}</span>
                  <div className="text-right">
                    <div className={asset.adjustAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {asset.adjustAmount > 0 ? '買入' : '賣出'} {formatCurrency(Math.abs(asset.adjustAmount))} 元
                    </div>
                    <div className="text-sm text-gray-600">
                      目標金額: {formatCurrency(asset.amount)} 元
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RebalanceCalculator;
