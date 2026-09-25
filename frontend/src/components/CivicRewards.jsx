import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Coins,
  Ticket,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Bus,
  BookOpen,
  Sprout,
  Building2,
  ShoppingBag,
  Receipt,
  X
} from 'lucide-react';

export default function CivicRewards({ currentUser }) {
  const [wallet, setWallet] = useState({ balance: 0, lifetime_earned: 0, transactions: [] });
  const [vouchers, setVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('marketplace'); // 'marketplace' | 'my-vouchers' | 'transactions'
  const [selectedVoucherForRedeem, setSelectedVoucherForRedeem] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedResult, setRedeemedResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const userId = currentUser?.id || 'citizen-active';

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletData, vouchersData, myVouchersData] = await Promise.all([
        api.getRewardsBalance(userId),
        api.getVouchers(),
        api.getMyVouchers(userId)
      ]);
      setWallet(walletData);
      setVouchers(vouchersData);
      setMyVouchers(myVouchersData);
    } catch (err) {
      console.error('Error loading rewards data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucher) => {
    if (wallet.balance < voucher.cost) {
      alert(`You need ${voucher.cost} GovCoins to redeem this voucher. Your current balance is ${wallet.balance} GC.`);
      return;
    }

    setRedeeming(true);
    try {
      const result = await api.redeemVoucher(userId, voucher.id);
      setRedeemedResult(result);
      setSelectedVoucherForRedeem(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to redeem voucher.');
    } finally {
      setRedeeming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getVoucherIcon = (iconName) => {
    switch (iconName) {
      case 'Bus':
        return <Bus className="w-5 h-5 text-raspberry" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-lemon" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-lime" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-raspberry" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-lemon" />;
      case 'Receipt':
        return <Receipt className="w-5 h-5 text-lime" />;
      default:
        return <Ticket className="w-5 h-5 text-pink-grapefruit" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Wallet Balance Header Banner */}
      <div className="bg-gradient-to-r from-raspberry via-pink-grapefruit to-lemon rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Coins className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white text-raspberry font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                MicroGov Civic Rewards
              </span>
              <span className="text-xs text-vanilla font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Proof-of-Civic-Action
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Citizen GovCoin Wallet</h2>
            <p className="text-xs md:text-sm text-cream/90 max-w-xl mt-1 font-medium">
              Earn GovCoins automatically whenever you report civic defects, attach voice notes, or verify local municipal resolutions. Redeem your coins for municipal perks and local discounts.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 self-start md:self-center">
            <div className="w-12 h-12 rounded-xl bg-white text-raspberry flex items-center justify-center font-black shadow-xs">
              <Coins className="w-7 h-7 text-lemon fill-lemon" />
            </div>
            <div>
              <span className="text-xs text-vanilla font-bold uppercase tracking-wider block">
                Current GovCoins
              </span>
              <span className="text-3xl font-black text-white">{wallet.balance} <span className="text-sm font-extrabold text-vanilla">GC</span></span>
              <span className="text-[10px] text-cream/80 block mt-0.5">
                Lifetime: {wallet.lifetime_earned} GC earned
              </span>
            </div>
          </div>
        </div>

        {/* Earning breakdown chips */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/20 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <span className="font-extrabold block text-vanilla">+50 GovCoins</span>
            <span className="text-[10px] text-cream/80">Report Civic Hazard</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <span className="font-extrabold block text-vanilla">+25 GovCoins</span>
            <span className="text-[10px] text-cream/80">Voice Note Evidence</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <span className="font-extrabold block text-vanilla">+10 GovCoins</span>
            <span className="text-[10px] text-cream/80">Community Upvotes</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <span className="font-extrabold block text-vanilla">+50 GovCoins</span>
            <span className="text-[10px] text-cream/80">Verified Resolution</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-vanilla pb-3">
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border-2 border-vanilla shadow-xs">
          <button
            onClick={() => setActiveSubTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeSubTab === 'marketplace'
                ? 'bg-raspberry text-white shadow-xs'
                : 'text-slate-600 hover:text-raspberry'
            }`}
          >
            Voucher Marketplace
          </button>
          <button
            onClick={() => setActiveSubTab('my-vouchers')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeSubTab === 'my-vouchers'
                ? 'bg-raspberry text-white shadow-xs'
                : 'text-slate-600 hover:text-raspberry'
            }`}
          >
            <span>My Vouchers</span>
            {myVouchers.length > 0 && (
              <span className="bg-lime text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {myVouchers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeSubTab === 'transactions'
                ? 'bg-raspberry text-white shadow-xs'
                : 'text-slate-600 hover:text-raspberry'
            }`}
          >
            GovCoin Ledger
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Marketplace */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Available Civic & Municipal Vouchers</h3>
            <span className="text-xs text-slate-500 font-semibold">
              Redeem with your earned GovCoins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vouchers.map((v) => {
              const canAfford = wallet.balance >= v.cost;
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border-2 border-vanilla p-6 flex flex-col justify-between hover:border-raspberry/50 transition shadow-2xs group relative"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-vanilla text-raspberry flex items-center justify-center font-bold">
                        {getVoucherIcon(v.icon_name)}
                      </div>
                      <span className="text-xs font-black text-raspberry bg-vanilla px-3 py-1 rounded-full border border-vanilla">
                        {v.cost} GC
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-pink-grapefruit">
                        {v.category} • {v.partner_name}
                      </span>
                      <h4 className="text-base font-black text-slate-900 group-hover:text-raspberry transition mt-0.5">
                        {v.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-vanilla">
                    <button
                      onClick={() => setSelectedVoucherForRedeem(v)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs ${
                        canAfford
                          ? 'bg-raspberry hover:bg-pink-grapefruit text-white cursor-pointer'
                          : 'bg-vanilla/60 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Redeem with GovCoins' : `Need ${v.cost - wallet.balance} More GC`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: My Vouchers Wallet */}
      {activeSubTab === 'my-vouchers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">My Active Vouchers & Coupons</h3>
            <span className="text-xs text-slate-500 font-semibold">
              Present these codes at partner facilities or online checkouts
            </span>
          </div>

          {myVouchers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-vanilla text-center space-y-3">
              <Ticket className="w-12 h-12 text-pink-grapefruit mx-auto opacity-50" />
              <h4 className="text-base font-black text-slate-800">No vouchers redeemed yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                File civic reports or verify issues to earn GovCoins and redeem your first municipal pass!
              </p>
              <button
                onClick={() => setActiveSubTab('marketplace')}
                className="mt-2 text-xs bg-raspberry text-white font-extrabold px-4 py-2 rounded-xl hover:bg-pink-grapefruit transition shadow-xs"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myVouchers.map((mv) => (
                <div
                  key={mv.id}
                  className="bg-white rounded-3xl border-2 border-lime/60 p-6 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-lime/10 text-lime px-2.5 py-0.5 rounded-full border border-lime/30">
                        Active & Valid
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        Redeemed {new Date(mv.redeemed_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-pink-grapefruit">
                        {mv.partner_name || 'Municipal Partner'}
                      </span>
                      <h4 className="text-lg font-black text-slate-900">{mv.voucher_title}</h4>
                    </div>

                    {/* Voucher Code Card */}
                    <div className="bg-cream p-4 rounded-2xl border-2 border-dashed border-vanilla flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Redemption Voucher Code:
                        </span>
                        <span className="font-mono text-base font-black text-raspberry tracking-wider">
                          {mv.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(mv.code)}
                        className="bg-white hover:bg-vanilla text-raspberry text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 border border-vanilla cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCode === mv.code ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    Show this code on your screen or copy it into the partner municipal app to claim your benefit.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: GovCoin Ledger */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white rounded-3xl border-2 border-vanilla p-6 md:p-8 space-y-4">
          <h3 className="text-xl font-black text-slate-900">GovCoin Transaction History</h3>
          <p className="text-xs text-slate-600 font-medium">
            Immutable log of all proof-of-civic-action rewards and voucher redemptions.
          </p>

          <div className="divide-y divide-vanilla/60 max-h-[500px] overflow-y-auto">
            {wallet.transactions?.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 block">
                      {tx.description}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(tx.created_at).toLocaleString()} • {tx.transaction_type}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-black px-3 py-1 rounded-xl ${
                      isPositive
                        ? 'bg-lime/10 text-lime border border-lime/30'
                        : 'bg-raspberry/10 text-raspberry border border-raspberry/30'
                    }`}
                  >
                    {isPositive ? `+${tx.amount}` : tx.amount} GC
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Voucher Redemption */}
      {selectedVoucherForRedeem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border-2 border-vanilla shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-vanilla pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-raspberry" />
                <span>Confirm Voucher Redemption</span>
              </h3>
              <button
                onClick={() => setSelectedVoucherForRedeem(null)}
                className="text-slate-400 hover:text-raspberry transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-cream p-4 rounded-2xl border border-vanilla space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-grapefruit">
                {selectedVoucherForRedeem.partner_name}
              </span>
              <h4 className="text-base font-black text-slate-900">
                {selectedVoucherForRedeem.title}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {selectedVoucherForRedeem.description}
              </p>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-vanilla text-xs">
              <span className="text-slate-600 font-medium">Redemption Cost:</span>
              <span className="font-black text-raspberry text-sm">
                -{selectedVoucherForRedeem.cost} GovCoins
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-vanilla text-xs">
              <span className="text-slate-600 font-medium">Balance After Redemption:</span>
              <span className="font-black text-slate-800 text-sm">
                {wallet.balance - selectedVoucherForRedeem.cost} GovCoins
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVoucherForRedeem(null)}
                className="w-1/2 py-3 rounded-xl border-2 border-vanilla text-slate-700 font-bold text-xs hover:bg-cream transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={redeeming}
                onClick={() => handleRedeem(selectedVoucherForRedeem)}
                className="w-1/2 py-3 rounded-xl bg-raspberry hover:bg-pink-grapefruit text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                {redeeming ? 'Redeeming...' : 'Confirm & Generate Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {redeemedResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border-2 border-lime/60 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-lime/20 text-lime rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Voucher Successfully Claimed!</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {redeemedResult.message}
              </p>
            </div>

            <div className="bg-cream p-4 rounded-2xl border-2 border-dashed border-vanilla space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Your Unique Claim Code:
              </span>
              <span className="font-mono text-xl font-black text-raspberry tracking-widest block">
                {redeemedResult.voucher.code}
              </span>
              <button
                onClick={() => copyToClipboard(redeemedResult.voucher.code)}
                className="mx-auto text-xs bg-white border border-vanilla px-3 py-1.5 rounded-xl font-bold text-raspberry hover:bg-vanilla transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode === redeemedResult.voucher.code ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setRedeemedResult(null);
                setActiveSubTab('my-vouchers');
              }}
              className="w-full py-3 rounded-xl bg-lime hover:opacity-90 text-white font-black text-xs shadow-md transition"
            >
              View in My Vouchers Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
