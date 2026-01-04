import { PageTransition } from '../../components/common/PageTransition';
import { LifeBuoy, Mail, Book, MessageCircle } from 'lucide-react';

export default function Support() {
    return (
        <PageTransition className="space-y-6">
            <h1 className="text-2xl font-bold text-text flex items-center gap-3">
                <LifeBuoy className="text-brand-blue" />
                Support & Documentation
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Documentation Card */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6 hover:border-brand-blue/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue/20 transition-colors">
                            <Book size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-text">Documentation</h3>
                    </div>
                    <p className="text-text-muted text-sm mb-4">
                        Comprehensive guides, API references, and troubleshooting tips for NexDefend.
                    </p>
                    <span className="text-brand-blue text-sm font-medium hover:underline">Read Docs &rarr;</span>
                </div>

                {/* Contact Support Card */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6 hover:border-brand-blue/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-brand-green/10 text-brand-green group-hover:bg-brand-green/20 transition-colors">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-text">Contact Support</h3>
                    </div>
                    <p className="text-text-muted text-sm mb-4">
                        Need help with your deployment? Our engineering team is here to assist.
                    </p>
                    <span className="text-brand-green text-sm font-medium hover:underline">Open Ticket &rarr;</span>
                </div>

                {/* Community Card */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6 hover:border-brand-blue/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange/20 transition-colors">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-text">Community Forum</h3>
                    </div>
                    <p className="text-text-muted text-sm mb-4">
                        Connect with other security professionals, share playbooks, and discuss threats.
                    </p>
                    <span className="text-brand-orange text-sm font-medium hover:underline">Join Discussion &rarr;</span>
                </div>
            </div>

            <div className="bg-surface border border-surface-highlight rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-text mb-4">System Status</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-surface-highlight/10 rounded">
                        <span className="text-text-muted">Cloud Connector API</span>
                        <span className="flex items-center gap-2 text-brand-green text-sm font-mono">
                            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                            Operational
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-highlight/10 rounded">
                        <span className="text-text-muted">Threat Intelligence Feeds</span>
                        <span className="flex items-center gap-2 text-brand-green text-sm font-mono">
                            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                            Operational
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-highlight/10 rounded">
                        <span className="text-text-muted">AI Analysis Engine</span>
                        <span className="flex items-center gap-2 text-brand-green text-sm font-mono">
                            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                            Operational
                        </span>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
