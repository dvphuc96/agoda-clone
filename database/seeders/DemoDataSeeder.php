<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingModification;
use App\Models\BookingPolicy;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Hotel;
use App\Models\HotelUser;
use App\Models\NotificationRecord;
use App\Models\Payment;
use App\Models\PriceOverride;
use App\Models\Refund;
use App\Models\Review;
use App\Models\RoomType;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    private array $userIds = [];
    private array $partnerIds = [];
    private array $bookingIds = [];

    public function run(): void
    {
        DB::transaction(function () {
            $this->seedUsers();
            $this->seedPartnerAssignments();
            $this->seedBookingPolicies();
            $this->seedBookings();
            $this->seedPayments();
            $this->seedReviews();
            $this->seedWishlists();
            $this->seedSupportTickets();
            $this->seedNotifications();
            $this->seedRefunds();
            $this->seedBookingModifications();
            $this->seedPriceOverrides();
            $this->seedChatSessions();
            $this->seedCouponUsages();
        });

        $this->command->info('Demo data seeded successfully!');
    }

    private function seedUsers(): void
    {
        $users = [
            ['name' => 'Nguyễn Văn An', 'email' => 'an.nguyen@example.com', 'phone' => '0901234567'],
            ['name' => 'Trần Thị Bình', 'email' => 'binh.tran@example.com', 'phone' => '0902345678'],
            ['name' => 'Lê Hoàng Cường', 'email' => 'cuong.le@example.com', 'phone' => '0903456789'],
            ['name' => 'Phạm Minh Dũng', 'email' => 'dung.pham@example.com', 'phone' => '0904567890'],
            ['name' => 'Hoàng Thu Hà', 'email' => 'ha.hoang@example.com', 'phone' => '0905678901'],
            ['name' => 'Võ Đức Long', 'email' => 'long.vo@example.com', 'phone' => '0906789012'],
            ['name' => 'Đặng Thanh Mai', 'email' => 'mai.dang@example.com', 'phone' => '0907890123'],
            ['name' => 'Bùi Quang Nhật', 'email' => 'nhat.bui@example.com', 'phone' => '0908901234'],
        ];

        foreach ($users as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => bcrypt('password'),
                'phone' => $u['phone'],
                'role' => 'user',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->userIds[] = $user->id;
        }

        // Partner users
        $partners = [
            ['name' => 'Ngô Quốc Phong', 'email' => 'phong.ngo@partner.com', 'phone' => '0912345678'],
            ['name' => 'Lý Thị Ngọc', 'email' => 'ngoc.ly@partner.com', 'phone' => '0913456789'],
            ['name' => 'Trịnh Văn Sỹ', 'email' => 'sy.trinh@partner.com', 'phone' => '0914567890'],
        ];

        foreach ($partners as $p) {
            $partner = User::create([
                'name' => $p['name'],
                'email' => $p['email'],
                'password' => bcrypt('password'),
                'phone' => $p['phone'],
                'role' => 'user',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->partnerIds[] = $partner->id;
        }
    }

    private function seedPartnerAssignments(): void
    {
        $hotels = Hotel::pluck('id')->toArray();

        // Assign first 8 hotels to partner 1
        foreach (array_slice($hotels, 0, 8) as $hid) {
            HotelUser::create(['user_id' => $this->partnerIds[0], 'hotel_id' => $hid, 'role' => 'owner']);
        }
        // Next 8 hotels to partner 2
        foreach (array_slice($hotels, 8, 8) as $hid) {
            HotelUser::create(['user_id' => $this->partnerIds[1], 'hotel_id' => $hid, 'role' => 'owner']);
        }
        // Remaining to partner 3
        foreach (array_slice($hotels, 16) as $hid) {
            HotelUser::create(['user_id' => $this->partnerIds[2], 'hotel_id' => $hid, 'role' => 'owner']);
        }
    }

    private function seedBookingPolicies(): void
    {
        $hotels = Hotel::all();

        foreach ($hotels as $hotel) {
            BookingPolicy::create([
                'hotel_id' => $hotel->id,
                'name' => 'Flexible',
                'description' => 'Hủy miễn phí trước 24h check-in',
                'free_cancellation_hours' => 24,
                'cancellation_fee_percent' => 10.00,
                'is_non_refundable' => false,
                'is_active' => true,
            ]);

            if ($hotel->star_rating >= 4) {
                BookingPolicy::create([
                    'hotel_id' => $hotel->id,
                    'name' => 'Non-Refundable',
                    'description' => 'Giá tốt nhất, không hoàn hủy',
                    'free_cancellation_hours' => 0,
                    'cancellation_fee_percent' => 100.00,
                    'is_non_refundable' => true,
                    'is_active' => true,
                ]);
            }
        }
    }

    private function seedBookings(): void
    {
        $roomTypes = RoomType::with('hotel')->get();
        $coupon = Coupon::where('code', 'WELCOME10')->first();

        $bookingData = [
            // Completed bookings (past)
            ['user' => 0, 'room' => 0, 'status' => 'completed', 'days' => -30, 'nights' => 3, 'guests' => 2],
            ['user' => 1, 'room' => 2, 'status' => 'completed', 'days' => -25, 'nights' => 2, 'guests' => 1],
            ['user' => 2, 'room' => 5, 'status' => 'completed', 'days' => -20, 'nights' => 4, 'guests' => 3],
            ['user' => 0, 'room' => 8, 'status' => 'completed', 'days' => -15, 'nights' => 2, 'guests' => 2],
            ['user' => 3, 'room' => 1, 'status' => 'completed', 'days' => -12, 'nights' => 3, 'guests' => 2],
            ['user' => 4, 'room' => 3, 'status' => 'completed', 'days' => -10, 'nights' => 5, 'guests' => 4],
            ['user' => 5, 'room' => 6, 'status' => 'completed', 'days' => -8, 'nights' => 2, 'guests' => 1],
            ['user' => 1, 'room' => 10, 'status' => 'completed', 'days' => -5, 'nights' => 3, 'guests' => 2],

            // Confirmed bookings (upcoming)
            ['user' => 0, 'room' => 4, 'status' => 'confirmed', 'days' => 5, 'nights' => 3, 'guests' => 2],
            ['user' => 2, 'room' => 7, 'status' => 'confirmed', 'days' => 7, 'nights' => 4, 'guests' => 3],
            ['user' => 6, 'room' => 0, 'status' => 'confirmed', 'days' => 10, 'nights' => 2, 'guests' => 2],
            ['user' => 3, 'room' => 9, 'status' => 'confirmed', 'days' => 3, 'nights' => 5, 'guests' => 4],
            ['user' => 7, 'room' => 12, 'status' => 'confirmed', 'days' => 14, 'nights' => 2, 'guests' => 1],
            ['user' => 4, 'room' => 15, 'status' => 'confirmed', 'days' => 8, 'nights' => 3, 'guests' => 2],

            // Cancelled bookings
            ['user' => 5, 'room' => 2, 'status' => 'cancelled', 'days' => -18, 'nights' => 2, 'guests' => 2],
            ['user' => 1, 'room' => 11, 'status' => 'cancelled', 'days' => -7, 'nights' => 3, 'guests' => 1],
            ['user' => 6, 'room' => 14, 'status' => 'cancelled', 'days' => -3, 'nights' => 4, 'guests' => 3],

            // Pending bookings
            ['user' => 0, 'room' => 3, 'status' => 'pending', 'days' => 2, 'nights' => 2, 'guests' => 2],
            ['user' => 7, 'room' => 6, 'status' => 'pending', 'days' => 1, 'nights' => 3, 'guests' => 1],
            ['user' => 3, 'room' => 8, 'status' => 'pending', 'days' => 4, 'nights' => 2, 'guests' => 2],
        ];

        foreach ($bookingData as $i => $bd) {
            $userId = $this->userIds[$bd['user']];
            $roomType = $roomTypes[$bd['room']] ?? $roomTypes[0];
            $baseCheckIn = now()->addDays($bd['days']);
            $checkIn = $baseCheckIn->copy();
            $checkOut = $checkIn->copy()->addDays($bd['nights']);

            $pricePerNight = (float) $roomType->price_per_night;
            $discount = ($i === 0 && $coupon) ? $pricePerNight * $bd['nights'] * 0.10 : 0;
            $totalPrice = ($pricePerNight * $bd['nights']) - $discount;

            $booking = Booking::create([
                'user_id' => $userId,
                'room_type_id' => $roomType->id,
                'coupon_id' => ($i === 0 && $coupon) ? $coupon->id : null,
                'booking_code' => 'BK' . strtoupper(Str::random(6)),
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests' => $bd['guests'],
                'special_requests' => $i % 4 === 0 ? 'Phòng tầng cao, view đẹp' : null,
                'total_price' => max($totalPrice, 0),
                'discount_amount' => $discount,
                'status' => $bd['status'],
                'expires_at' => $bd['status'] === 'pending' ? now()->addMinutes(30) : null,
            ]);

            $this->bookingIds[] = $booking->id;
        }
    }

    private function seedPayments(): void
    {
        foreach ($this->bookingIds as $i => $bookingId) {
            $booking = Booking::find($bookingId);
            if (!$booking) continue;

            $method = $i % 2 === 0 ? 'vnpay' : 'momo';

            if ($booking->status === 'completed' || $booking->status === 'confirmed') {
                Payment::create([
                    'booking_id' => $booking->id,
                    'payment_method' => $method,
                    'transaction_id' => strtoupper(Str::random(12)),
                    'amount' => $booking->total_price,
                    'currency' => 'VND',
                    'status' => 'success',
                    'paid_at' => $booking->created_at,
                    'gateway_response' => ['code' => '00', 'message' => 'Success'],
                ]);
            } elseif ($booking->status === 'cancelled') {
                // Some cancelled had payment, some didn't
                if ($i % 2 === 0) {
                    Payment::create([
                        'booking_id' => $booking->id,
                        'payment_method' => $method,
                        'transaction_id' => strtoupper(Str::random(12)),
                        'amount' => $booking->total_price,
                        'currency' => 'VND',
                        'status' => 'success',
                        'paid_at' => $booking->created_at,
                        'gateway_response' => ['code' => '00', 'message' => 'Success'],
                    ]);
                } else {
                    Payment::create([
                        'booking_id' => $booking->id,
                        'payment_method' => $method,
                        'transaction_id' => null,
                        'amount' => $booking->total_price,
                        'currency' => 'VND',
                        'status' => 'failed',
                        'gateway_response' => ['code' => '99', 'message' => 'Failed'],
                    ]);
                }
            } elseif ($booking->status === 'pending') {
                Payment::create([
                    'booking_id' => $booking->id,
                    'payment_method' => $method,
                    'transaction_id' => null,
                    'amount' => $booking->total_price,
                    'currency' => 'VND',
                    'status' => 'pending',
                    'gateway_response' => null,
                ]);
            }
        }
    }

    private function seedReviews(): void
    {
        $completedBookings = Booking::with('roomType.hotel')
            ->where('status', 'completed')
            ->get();

        $comments = [
            ['title' => 'Tuyệt vời', 'comment' => 'Phòng sạch sẽ, nhân viên thân thiện, sẽ quay lại!', 'rating' => 5],
            ['title' => 'Rất tốt', 'comment' => 'Vị trí thuận tiện, gần trung tâm. Bữa sáng ngon.', 'rating' => 4],
            ['title' => 'Hài lòng', 'comment' => 'Phòng rộng rãi, view đẹp. Giá hợp lý.', 'rating' => 4],
            ['title' => 'Bình thường', 'comment' => 'Phòng ổn nhưng hơi ồn. Nhân viên phục vụ tốt.', 'rating' => 3],
            ['title' => 'Xuất sắc', 'comment' => 'Trải nghiệm tuyệt vời từ A-Z. Highly recommended!', 'rating' => 5],
            ['title' => 'Rất hài lòng', 'comment' => 'Dịch vụ chuyên nghiệp, phòng ấm cúng và sạch sẽ.', 'rating' => 5],
            ['title' => 'Tạm ổn', 'comment' => 'Giá rẻ nhưng chất lượng khá tốt. WiFi hơi yếu.', 'rating' => 3],
            ['title' => 'Đáng đồng tiền', 'comment' => 'View biển tuyệt đẹp, hồ bơi rộng. Sẽ quay lại.', 'rating' => 4],
        ];

        $usedPairs = [];
        foreach ($completedBookings as $i => $booking) {
            $hotelId = $booking->roomType->hotel->id;
            $key = $booking->user_id . '_' . $hotelId;
            if (in_array($key, $usedPairs)) continue;
            $usedPairs[] = $key;

            $reviewData = $comments[$i % count($comments)];
            $statuses = ['approved', 'approved', 'approved', 'pending'];
            Review::create([
                'user_id' => $booking->user_id,
                'hotel_id' => $hotelId,
                'booking_id' => $booking->id,
                'rating' => $reviewData['rating'],
                'title' => $reviewData['title'],
                'comment' => $reviewData['comment'],
                'status' => $statuses[$i % count($statuses)],
            ]);
        }
    }

    private function seedWishlists(): void
    {
        $hotels = Hotel::pluck('id')->toArray();
        $pairs = [];

        foreach ($this->userIds as $userId) {
            $count = rand(2, 4);
            $selected = (array) array_rand(array_flip($hotels), min($count, count($hotels)));
            if (!is_array($selected)) $selected = [$selected];

            foreach ($selected as $hotelId) {
                $key = $userId . '_' . $hotelId;
                if (in_array($key, $pairs)) continue;
                $pairs[] = $key;

                Wishlist::create([
                    'user_id' => $userId,
                    'hotel_id' => $hotelId,
                ]);
            }
        }
    }

    private function seedSupportTickets(): void
    {
        $tickets = [
            ['subject' => 'Yêu cầu hoàn tiền đặt phòng', 'category' => 'booking', 'priority' => 'high', 'status' => 'resolved'],
            ['subject' => 'Lỗi thanh toán VNPay', 'category' => 'payment', 'priority' => 'urgent', 'status' => 'in_progress'],
            ['subject' => 'Phòng không đúng như hình', 'category' => 'hotel', 'priority' => 'normal', 'status' => 'open'],
            ['subject' => 'Hỗ trợ đổi ngày check-in', 'category' => 'booking', 'priority' => 'normal', 'status' => 'closed'],
            ['subject' => 'Đặt xe đưa đón sân bay', 'category' => 'transfer', 'priority' => 'low', 'status' => 'open'],
            ['subject' => 'Vấn đề khác', 'category' => 'other', 'priority' => 'low', 'status' => 'resolved'],
        ];

        $userMessages = [
            'Xin chào, tôi muốn yêu cầu hoàn tiền cho đặt phòng gần đây.',
            'Tôi đã thanh toán nhưng hệ thống báo lỗi. Tiền đã bị trừ.',
            'Phòng thực tế không giống hình trên website. Rất thất vọng.',
            'Tôi muốn đổi ngày check-in từ 15/06 sang 17/06. Xin hỗ trợ.',
            'Cho tôi hỏi cách đặt xe đưa đón sân bay đi khách hàng?',
            'Cảm ơn bạn đã hỗ trợ, vấn đề đã được giải quyết.',
        ];

        $adminMessages = [
            'Chào bạn, chúng tôi đã tiếp nhận yêu cầu. Vui lòng cung cấp mã đặt phòng.',
            'Chúng tôi đang kiểm tra với VNPay. Sẽ phản hồi trong 24h.',
            'Xin lỗi vì sự bất tiện. Chúng tôi sẽ kiểm tra và phản hồi sớm.',
            'Đã đổi ngày check-in thành công. Vui lòng kiểm tra email xác nhận.',
            'Bạn có thể đặt xe trong trang chi tiết đặt phòng, phần "Dịch vụ đưa đón".',
            'Cảm ơn bạn! Chúc bạn có trải nghiệm tốt với GoStay.',
        ];

        foreach ($tickets as $i => $td) {
            $userId = $this->userIds[$i % count($this->userIds)];
            $booking = Booking::where('user_id', $userId)->first();

            $ticket = SupportTicket::create([
                'user_id' => $userId,
                'booking_code' => $booking?->booking_code,
                'subject' => $td['subject'],
                'category' => $td['category'],
                'status' => $td['status'],
                'priority' => $td['priority'],
            ]);

            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => $userId,
                'is_admin' => false,
                'message' => $userMessages[$i],
            ]);

            if ($td['status'] !== 'open') {
                TicketMessage::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => 1,
                    'is_admin' => true,
                    'message' => $adminMessages[$i],
                ]);
            }
        }
    }

    private function seedNotifications(): void
    {
        $types = [
            ['type' => 'booking_confirmed', 'payload' => ['message' => 'Đặt phòng đã được xác nhận']],
            ['type' => 'booking_cancelled', 'payload' => ['message' => 'Đặt phòng đã bị hủy']],
            ['type' => 'payment_success', 'payload' => ['message' => 'Thanh toán thành công']],
            ['type' => 'review_approved', 'payload' => ['message' => 'Đánh giá của bạn đã được duyệt']],
            ['type' => 'refund_processed', 'payload' => ['message' => 'Hoàn tiền đã được xử lý']],
        ];

        foreach ($this->userIds as $userId) {
            $booking = Booking::where('user_id', $userId)->first();
            foreach (array_rand(array_flip(range(0, count($types) - 1)), 3) as $idx) {
                NotificationRecord::create([
                    'user_id' => $userId,
                    'booking_id' => $booking?->id,
                    'type' => $types[$idx]['type'],
                    'channel' => 'database',
                    'status' => 'sent',
                    'payload' => $types[$idx]['payload'],
                    'sent_at' => now()->subHours(rand(1, 48)),
                ]);
            }
        }
    }

    private function seedRefunds(): void
    {
        $cancelledWithPayment = Booking::where('status', 'cancelled')
            ->whereHas('payments', fn($q) => $q->where('status', 'success'))
            ->get();

        foreach ($cancelledWithPayment as $booking) {
            $payment = $booking->payments->firstWhere('status', 'success');

            Refund::create([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'amount' => (float) $booking->total_price,
                'reason' => 'Khách hàng yêu cầu hủy đặt phòng',
                'status' => $booking->created_at->diffInHours(now()) > 24 ? 'completed' : 'pending',
                'requested_by' => $booking->user_id,
                'processed_by' => $booking->created_at->diffInHours(now()) > 24 ? 1 : null,
                'processed_at' => $booking->created_at->diffInHours(now()) > 24 ? now() : null,
            ]);
        }
    }

    private function seedBookingModifications(): void
    {
        $confirmedBookings = Booking::with('roomType')
            ->whereIn('status', ['confirmed', 'completed'])
            ->take(4)
            ->get();

        $modStatuses = ['approved', 'pending', 'rejected', 'approved'];

        foreach ($confirmedBookings as $i => $booking) {
            BookingModification::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'old_check_in' => $booking->check_in,
                'old_check_out' => $booking->check_out,
                'old_guests' => $booking->guests,
                'old_total_price' => $booking->total_price,
                'new_check_in' => $booking->check_in->copy()->addDays(1),
                'new_check_out' => $booking->check_out->copy()->addDays(1),
                'new_guests' => $booking->guests + 1,
                'new_total_price' => (float) $booking->total_price + (float) $booking->roomType->price_per_night,
                'status' => $modStatuses[$i],
                'admin_notes' => $modStatuses[$i] === 'rejected' ? 'Không thể đổi ngày do phòng đã hết' : null,
            ]);
        }
    }

    private function seedPriceOverrides(): void
    {
        $roomTypes = RoomType::inRandomOrder()->take(10)->get();

        foreach ($roomTypes as $rt) {
            $isPremium = $rt->price_per_night > 2000000;
            $multiplier = $isPremium ? 0.85 : 1.15;

            PriceOverride::create([
                'room_type_id' => $rt->id,
                'start_date' => now()->addDays(15),
                'end_date' => now()->addDays(25),
                'price_per_night' => round((float) $rt->price_per_night * $multiplier),
                'label' => $isPremium ? 'Early Bird Discount' : 'Peak Season Surcharge',
                'is_active' => true,
            ]);
        }
    }

    private function seedChatSessions(): void
    {
        $conversations = [
            [
                'context' => ['hotel_name' => 'Meliá Hanoi', 'intent' => 'search'],
                'messages' => [
                    ['role' => 'user', 'content' => 'Xin chào, tôi muốn tìm khách sạn ở Hà Nội'],
                    ['role' => 'assistant', 'content' => 'Chào bạn! GoStay có nhiều khách sạn ở Hà Nội. Bạn cần phòng cho bao nhiêu người?'],
                    ['role' => 'user', 'content' => '2 người, khoảng 1-2 triệu/đêm'],
                    ['role' => 'assistant', 'content' => 'Tôi gợi ý Meliá Hanoi - phòng Deluxe giá 1.500.000 VNĐ/đêm, view thành phố rất đẹp! Bạn muốn đặt không?'],
                ],
            ],
            [
                'context' => ['hotel_name' => 'Novotel Da Nang', 'intent' => 'booking_help'],
                'messages' => [
                    ['role' => 'user', 'content' => 'Cách đặt phòng trên GoStay như thế nào?'],
                    ['role' => 'assistant', 'content' => 'Rất đơn giản! Bạn tìm khách sạn mong muốn, chọn loại phòng, điền thông tin và thanh toán. Bạn cần hỗ trợ đặt phòng cụ thể không?'],
                    ['role' => 'user', 'content' => 'Tôi muốn đặt Novotel Đà Nẵng tuần tới'],
                    ['role' => 'assistant', 'content' => 'Novotel Đà Nẵng có phòng Superior và Suite. Ngày check-in cụ thể là khi nào ạ?'],
                ],
            ],
        ];

        foreach ($this->userIds as $i => $userId) {
            if ($i >= count($conversations)) break;

            $session = ChatSession::create([
                'user_id' => $userId,
                'context' => $conversations[$i]['context'],
            ]);

            foreach ($conversations[$i]['messages'] as $msg) {
                ChatMessage::create([
                    'session_id' => $session->id,
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ]);
            }
        }
    }

    private function seedCouponUsages(): void
    {
        $bookingsWithCoupon = Booking::whereNotNull('coupon_id')->get();
        foreach ($bookingsWithCoupon as $booking) {
            CouponUsage::create([
                'coupon_id' => $booking->coupon_id,
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
            ]);
        }

        // Extra usages for SUMMER20
        $summerCoupon = Coupon::where('code', 'SUMMER20')->first();
        if ($summerCoupon) {
            $confirmedBookings = Booking::whereNull('coupon_id')
                ->where('status', 'confirmed')
                ->take(2)
                ->get();

            foreach ($confirmedBookings as $booking) {
                CouponUsage::create([
                    'coupon_id' => $summerCoupon->id,
                    'user_id' => $booking->user_id,
                    'booking_id' => $booking->id,
                ]);
            }
        }
    }
}
